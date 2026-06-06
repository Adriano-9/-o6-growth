"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Cliente,
  Concorrente,
  Diagnostico,
  ICP,
  Oferta,
  OfferBookState,
  Psicografia,
  emptyConcorrente,
  emptyState,
} from "./types";
import { AiOutput } from "./ai-types";
import { getSupabase } from "./supabase";

const CURRENT_KEY = "o6.offer-book.current";

// ─────────────────────────────────────────────────────────────
// Mapping helpers (camelCase <-> snake_case for cliente/diagnostico)
// ─────────────────────────────────────────────────────────────

function clienteToRow(c: Cliente) {
  return {
    empresa: c.empresa,
    site: c.site,
    instagram: c.instagram,
    nicho: c.nicho,
    cidade: c.cidade,
    estado: c.estado,
    ticket_medio: c.ticketMedio,
    fonte_leads: c.fonteLeads,
  };
}

function rowToCliente(r: Record<string, unknown>): Cliente {
  return {
    empresa: (r.empresa as string) ?? "",
    site: (r.site as string) ?? "",
    instagram: (r.instagram as string) ?? "",
    nicho: (r.nicho as string) ?? "",
    cidade: (r.cidade as string) ?? "",
    estado: (r.estado as string) ?? "",
    ticketMedio: (r.ticket_medio as string) ?? "",
    fonteLeads: (r.fonte_leads as string) ?? "",
  };
}

function diagnosticoToRow(d: Diagnostico) {
  return {
    tempo_resposta: d.tempoResposta,
    origem_leads: d.origemLeads,
    crm: d.crm,
    vendedores: d.vendedores,
    ticket_medio: d.ticketMedio,
    conversao_atual: d.conversaoAtual,
    leads_mes: d.leadsMes,
  };
}

function rowToDiagnostico(r: Record<string, unknown> | null | undefined): Diagnostico {
  if (!r) return { ...emptyState.diagnostico };
  return {
    tempoResposta: (r.tempo_resposta as string) ?? "",
    origemLeads: (r.origem_leads as string) ?? "",
    crm: (r.crm as string) ?? "",
    vendedores: (r.vendedores as string) ?? "",
    ticketMedio: (r.ticket_medio as string) ?? "",
    conversaoAtual: (r.conversao_atual as string) ?? "",
    leadsMes: (r.leads_mes as string) ?? "",
  };
}

function rowToOfferBookSlices(r: Record<string, unknown> | null | undefined) {
  if (!r) {
    return {
      icp: { ...emptyState.icp },
      psicografia: { ...emptyState.psicografia },
      oferta: { ...emptyState.oferta },
      concorrentes: [] as Concorrente[],
    };
  }
  const icp = (r.icp as Partial<ICP>) ?? {};
  const psicografia = (r.psicografia as Partial<Psicografia>) ?? {};
  const oferta = (r.oferta as Partial<Oferta>) ?? {};
  const concorrentes = Array.isArray(r.concorrentes)
    ? (r.concorrentes as Concorrente[])
    : [];
  return {
    icp: { ...emptyState.icp, ...icp },
    psicografia: { ...emptyState.psicografia, ...psicografia },
    oferta: { ...emptyState.oferta, ...oferta },
    concorrentes,
  };
}

// ─────────────────────────────────────────────────────────────
// Public list-item shape for /clientes-dashboard
// ─────────────────────────────────────────────────────────────

export type ClienteListItem = {
  id: string;
  empresa: string;
  nicho: string;
  cidade: string;
  estado: string;
  updatedAt: string;
  state: OfferBookState;
};

// ─────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────

type StoreContextValue = {
  state: OfferBookState;
  hydrated: boolean;
  syncing: boolean;
  currentClienteId: string | null;

  setCliente: (next: Cliente) => void;
  setICP: (next: ICP) => void;
  setPsicografia: (next: Psicografia) => void;
  setOferta: (next: Oferta) => void;
  setDiagnostico: (next: Diagnostico) => void;
  addConcorrente: () => void;
  updateConcorrente: (id: string, patch: Partial<Concorrente>) => void;
  removeConcorrente: (id: string) => void;

  createCliente: (initial?: Partial<Cliente>) => Promise<string | null>;
  selectCliente: (id: string | null) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  listClientes: () => Promise<ClienteListItem[]>;
  reset: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function OfferBookProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OfferBookState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [currentClienteId, setCurrentClienteIdState] = useState<string | null>(
    null,
  );

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const currentIdRef = useRef<string | null>(null);

  const setCurrent = useCallback((id: string | null) => {
    currentIdRef.current = id;
    setCurrentClienteIdState(id);
    if (typeof window !== "undefined") {
      try {
        if (id) window.localStorage.setItem(CURRENT_KEY, id);
        else window.localStorage.removeItem(CURRENT_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const scheduleSave = useCallback(
    (key: string, fn: () => Promise<void>, ms = 600) => {
      const timers = saveTimers.current;
      if (timers[key]) clearTimeout(timers[key]!);
      timers[key] = setTimeout(() => {
        setSyncing(true);
        fn()
          .catch((err) => console.error(`[offer-book] save ${key} failed`, err))
          .finally(() => setSyncing(false));
      }, ms);
    },
    [],
  );

  const loadCliente = useCallback(async (id: string) => {
    const sb = getSupabase();
    if (!sb) return;

    const [{ data: c }, { data: d }, { data: o }] = await Promise.all([
      sb.from("clientes").select("*").eq("id", id).maybeSingle(),
      sb.from("diagnosticos").select("*").eq("cliente_id", id).maybeSingle(),
      sb.from("offer_books").select("*").eq("cliente_id", id).maybeSingle(),
    ]);

    if (!c) {
      // cliente was deleted elsewhere
      setCurrent(null);
      setState(emptyState);
      return;
    }

    const slices = rowToOfferBookSlices(o);
    setState({
      cliente: rowToCliente(c),
      diagnostico: rowToDiagnostico(d),
      icp: slices.icp,
      psicografia: slices.psicografia,
      oferta: slices.oferta,
      concorrentes: slices.concorrentes,
    });
  }, [setCurrent]);

  // ─── Initial hydration ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let id: string | null = null;
      try {
        id = window.localStorage.getItem(CURRENT_KEY);
      } catch {
        /* ignore */
      }
      if (id) {
        currentIdRef.current = id;
        setCurrentClienteIdState(id);
        try {
          await loadCliente(id);
        } catch (err) {
          console.error("[offer-book] hydrate failed", err);
        }
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadCliente]);

  // ─── Setters (user mutations → debounced save) ───

  const setCliente = useCallback(
    (next: Cliente) => {
      setState((s) => ({ ...s, cliente: next }));
      const id = currentIdRef.current;
      if (!id) return;
      scheduleSave("cliente", async () => {
        const sb = getSupabase();
        if (!sb) return;
        await sb.from("clientes").update(clienteToRow(next)).eq("id", id);
      });
    },
    [scheduleSave],
  );

  const setDiagnostico = useCallback(
    (next: Diagnostico) => {
      setState((s) => ({ ...s, diagnostico: next }));
      const id = currentIdRef.current;
      if (!id) return;
      scheduleSave("diagnostico", async () => {
        const sb = getSupabase();
        if (!sb) return;
        await sb
          .from("diagnosticos")
          .update(diagnosticoToRow(next))
          .eq("cliente_id", id);
      });
    },
    [scheduleSave],
  );

  const saveOfferBookSlice = useCallback(
    (patch: Record<string, unknown>) => {
      const id = currentIdRef.current;
      if (!id) return;
      scheduleSave("offer_book", async () => {
        const sb = getSupabase();
        if (!sb) return;
        await sb.from("offer_books").update(patch).eq("cliente_id", id);
      });
    },
    [scheduleSave],
  );

  const setICP = useCallback(
    (next: ICP) => {
      setState((s) => ({ ...s, icp: next }));
      saveOfferBookSlice({ icp: next });
    },
    [saveOfferBookSlice],
  );

  const setPsicografia = useCallback(
    (next: Psicografia) => {
      setState((s) => ({ ...s, psicografia: next }));
      saveOfferBookSlice({ psicografia: next });
    },
    [saveOfferBookSlice],
  );

  const setOferta = useCallback(
    (next: Oferta) => {
      setState((s) => ({ ...s, oferta: next }));
      saveOfferBookSlice({ oferta: next });
    },
    [saveOfferBookSlice],
  );

  const persistConcorrentes = useCallback(
    (concorrentes: Concorrente[]) => {
      saveOfferBookSlice({ concorrentes });
    },
    [saveOfferBookSlice],
  );

  const addConcorrente = useCallback(() => {
    setState((s) => {
      const next = [...s.concorrentes, emptyConcorrente()];
      persistConcorrentes(next);
      return { ...s, concorrentes: next };
    });
  }, [persistConcorrentes]);

  const updateConcorrente = useCallback(
    (id: string, patch: Partial<Concorrente>) => {
      setState((s) => {
        const next = s.concorrentes.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        );
        persistConcorrentes(next);
        return { ...s, concorrentes: next };
      });
    },
    [persistConcorrentes],
  );

  const removeConcorrente = useCallback(
    (id: string) => {
      setState((s) => {
        const next = s.concorrentes.filter((c) => c.id !== id);
        persistConcorrentes(next);
        return { ...s, concorrentes: next };
      });
    },
    [persistConcorrentes],
  );

  // ─── Cliente CRUD ───

  const createCliente = useCallback(
    async (initial?: Partial<Cliente>): Promise<string | null> => {
      const sb = getSupabase();
      if (!sb) return null;

      const clienteBase: Cliente = { ...emptyState.cliente, ...initial };
      const { data: inserted, error } = await sb
        .from("clientes")
        .insert(clienteToRow(clienteBase))
        .select("id")
        .single();
      if (error || !inserted) {
        console.error("[offer-book] createCliente failed", error);
        return null;
      }
      const newId = inserted.id as string;

      // Create empty child rows for 1:1 relations
      await Promise.all([
        sb.from("diagnosticos").insert({
          cliente_id: newId,
          ...diagnosticoToRow(emptyState.diagnostico),
        }),
        sb.from("offer_books").insert({
          cliente_id: newId,
          icp: emptyState.icp,
          psicografia: emptyState.psicografia,
          oferta: emptyState.oferta,
          concorrentes: [],
        }),
      ]);

      setCurrent(newId);
      setState({ ...emptyState, cliente: clienteBase });
      return newId;
    },
    [setCurrent],
  );

  const selectCliente = useCallback(
    async (id: string | null) => {
      // Cancel any pending writes for the previous cliente
      Object.values(saveTimers.current).forEach((t) => t && clearTimeout(t));
      saveTimers.current = {};

      if (!id) {
        setCurrent(null);
        setState(emptyState);
        return;
      }
      setCurrent(id);
      await loadCliente(id);
    },
    [loadCliente, setCurrent],
  );

  const deleteCliente = useCallback(
    async (id: string) => {
      const sb = getSupabase();
      if (!sb) return;
      await sb.from("clientes").delete().eq("id", id);
      if (currentIdRef.current === id) {
        setCurrent(null);
        setState(emptyState);
      }
    },
    [setCurrent],
  );

  const listClientes = useCallback(async (): Promise<ClienteListItem[]> => {
    const sb = getSupabase();
    if (!sb) return [];
    const { data, error } = await sb
      .from("clientes")
      .select("*, diagnosticos(*), offer_books(*)")
      .order("updated_at", { ascending: false });
    if (error || !data) {
      console.error("[offer-book] listClientes failed", error);
      return [];
    }

    return (data as Record<string, unknown>[]).map((row) => {
      const cliente = rowToCliente(row);
      const diagRow = Array.isArray(row.diagnosticos)
        ? (row.diagnosticos[0] as Record<string, unknown> | undefined)
        : (row.diagnosticos as Record<string, unknown> | undefined);
      const obRow = Array.isArray(row.offer_books)
        ? (row.offer_books[0] as Record<string, unknown> | undefined)
        : (row.offer_books as Record<string, unknown> | undefined);
      const diagnostico = rowToDiagnostico(diagRow);
      const slices = rowToOfferBookSlices(obRow);
      return {
        id: row.id as string,
        empresa: cliente.empresa,
        nicho: cliente.nicho,
        cidade: cliente.cidade,
        estado: cliente.estado,
        updatedAt: (row.updated_at as string) ?? (row.created_at as string) ?? "",
        state: {
          cliente,
          diagnostico,
          icp: slices.icp,
          psicografia: slices.psicografia,
          oferta: slices.oferta,
          concorrentes: slices.concorrentes,
        },
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...emptyState, cliente: s.cliente }));
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      hydrated,
      syncing,
      currentClienteId,
      setCliente,
      setICP,
      setPsicografia,
      setOferta,
      setDiagnostico,
      addConcorrente,
      updateConcorrente,
      removeConcorrente,
      createCliente,
      selectCliente,
      deleteCliente,
      listClientes,
      reset,
    }),
    [
      state,
      hydrated,
      syncing,
      currentClienteId,
      setCliente,
      setICP,
      setPsicografia,
      setOferta,
      setDiagnostico,
      addConcorrente,
      updateConcorrente,
      removeConcorrente,
      createCliente,
      selectCliente,
      deleteCliente,
      listClientes,
      reset,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useOfferBook() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useOfferBook must be used inside OfferBookProvider");
  }
  return ctx;
}
