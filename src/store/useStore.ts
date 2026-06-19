import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from '../utils/uuid';
import { DEFAULT_CONFIG, calcularProximaRevisao, calcularAproveitamento } from '../utils/algoritmoRevisao';
import { today, daysAgo, daysFromNow, isPast } from '../utils/dateUtils';
import type { Revisao, Simulado, Tarefa, ConfigAlgoritmo, GrandeArea, TipoAtividade } from '../types';

function makeSeedData() {
  const revisoes: Revisao[] = [];
  const add = (
    tipo: TipoAtividade, area: GrandeArea, subArea: string,
    data: string, tempo: number, feitas: number, acertadas: number,
    status: Revisao['status'] = 'Concluída', proxima?: string
  ) => {
    const ap = calcularAproveitamento(feitas, acertadas);
    const pr = status === 'Concluída' && proxima
      ? proxima
      : status === 'Concluída'
        ? calcularProximaRevisao(ap, data, DEFAULT_CONFIG)
        : null;
    revisoes.push({
      id: uuid(),
      tipo, grandeArea: area, subArea,
      dataRevisao: data, tempoEstudo: tempo,
      questoesFeitas: feitas, questoesAcertadas: acertadas,
      aproveitamento: ap, status,
      proximaRevisao: pr,
      gerarRevisaoInteligente: true,
      createdAt: data + 'T10:00:00Z',
    });
  };

  // Sessões concluídas (histórico)
  add('Flashcards', 'Flashcards', 'Sessão de Flashcards', daysAgo(0), 120, 482, 482);
  add('Questoes', 'Clínica Médica', 'Esquizofrenia', daysAgo(1), 50, 21, 15);
  add('Questoes', 'Clínica Médica', 'TOC', daysAgo(1), 40, 10, 10);
  add('Flashcards', 'Flashcards', 'Sessão de Flashcards', daysAgo(1), 100, 340, 340);
  add('Questoes', 'Clínica Médica', 'TEA e TDAH', daysAgo(2), 40, 10, 8);
  add('Questoes', 'Clínica Médica', 'Transtorno mental na infância', daysAgo(2), 30, 6, 5);
  add('Flashcards', 'Flashcards', 'Sessão de Flashcards', daysAgo(2), 60, 213, 213);
  add('Questoes', 'Clínica Médica', 'Transtornos de Ansiedade', daysAgo(2), 10, 1, 1);
  add('Flashcards', 'Flashcards', 'Sessão de Flashcards', daysAgo(3), 174, 337, 337);
  add('Questoes', 'Clínica Médica', 'Transtornos de humor', daysAgo(3), 30, 22, 14);
  add('Questoes', 'Pediatria', 'ITU', daysAgo(4), 30, 12, 12);
  add('Questoes', 'Pediatria', 'Bronquiolite', daysAgo(4), 40, 10, 9);
  add('Questoes', 'Pediatria', 'Derrame pleural', daysAgo(5), 35, 8, 7);
  add('Questoes', 'Preventiva', 'Doenças exantemáticas', daysAgo(5), 45, 15, 12);
  add('Questoes', 'Pediatria', 'Otite média aguda', daysAgo(6), 30, 10, 8);
  add('Questoes', 'Pediatria', 'Ventilação mecânica', daysAgo(6), 40, 8, 6);
  add('Flashcards', 'Flashcards', 'Sessão de Flashcards', daysAgo(7), 120, 482, 482);
  add('Questoes', 'Pediatria', 'Crupe', daysAgo(7), 25, 7, 5);
  add('Questoes', 'Clínica Médica', 'DPOC', daysAgo(8), 40, 10, 7);
  add('Questoes', 'Preventiva', 'IVAS', daysAgo(9), 30, 12, 10);
  add('Questoes', 'Pediatria', 'Síndrome ictérica', daysAgo(10), 45, 15, 13);
  add('Questoes', 'Clínica Médica', 'Hipertensão Arterial Sistêmica', daysAgo(12), 50, 18, 14);
  add('Questoes', 'Preventiva', 'Dengue', daysAgo(14), 35, 10, 8);
  add('Questoes', 'Pediatria', 'Aleitamento materno', daysAgo(15), 30, 8, 8);
  add('Questoes', 'Pediatria', 'Pneumonia', daysAgo(15), 35, 10, 9);
  add('Questoes', 'Pediatria', 'Reanimação neonatal', daysAgo(16), 40, 12, 11);
  add('Questoes', 'Clínica Médica', 'Transtornos alimentares', daysAgo(18), 30, 8, 6);
  add('Questoes', 'Clínica Médica', 'Transtornos do neurodesenvolvimento', daysAgo(20), 45, 14, 10);
  add('Questoes', 'Preventiva', 'SUS', daysAgo(22), 30, 8, 5);
  add('Questoes', 'Clínica Médica', 'RAPS / CAPS', daysAgo(25), 35, 10, 6);
  add('Questoes', 'Pediatria', 'Icterícia neonatal', daysAgo(28), 30, 10, 8);
  add('Questoes', 'Clínica Médica', 'IRA e DRC', daysAgo(30), 40, 12, 9);

  // Pendentes (agendadas futuras)
  add('Questoes', 'Pediatria', 'ITU', daysFromNow(2), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'Esquizofrenia', daysFromNow(3), 0, 0, 0, 'Pendente');
  add('Flashcards', 'Flashcards', 'Sessão de Flashcards', daysFromNow(3), 0, 0, 0, 'Pendente');
  add('Questoes', 'Pediatria', 'Bronquiolite', daysFromNow(5), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'TEA e TDAH', daysFromNow(5), 0, 0, 0, 'Pendente');
  add('Questoes', 'Preventiva', 'Doenças exantemáticas', daysFromNow(7), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'TOC', daysFromNow(14), 0, 0, 0, 'Pendente');
  add('Questoes', 'Pediatria', 'Otite média aguda', daysFromNow(14), 0, 0, 0, 'Pendente');
  add('Questoes', 'Preventiva', 'IVAS', daysFromNow(18), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'Transtornos de humor', daysFromNow(22), 0, 0, 0, 'Pendente');
  add('Questoes', 'Pediatria', 'Aleitamento materno', daysFromNow(26), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'Hipertensão Arterial Sistêmica', daysFromNow(28), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'DPOC', daysFromNow(22), 0, 0, 0, 'Pendente');
  add('Questoes', 'Pediatria', 'Síndrome ictérica', daysFromNow(35), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'Transtorno mental na infância', daysFromNow(18), 0, 0, 0, 'Pendente');
  add('Questoes', 'Pediatria', 'Reanimação neonatal', daysFromNow(35), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'Transtornos de Ansiedade', daysFromNow(45), 0, 0, 0, 'Pendente');
  add('Questoes', 'Preventiva', 'Dengue', daysFromNow(18), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'IRA e DRC', daysFromNow(18), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'Transtornos alimentares', daysFromNow(22), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'Transtornos do neurodesenvolvimento', daysFromNow(18), 0, 0, 0, 'Pendente');
  add('Questoes', 'Preventiva', 'SUS', daysFromNow(14), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'RAPS / CAPS', daysFromNow(18), 0, 0, 0, 'Pendente');
  add('Questoes', 'Pediatria', 'Icterícia neonatal', daysFromNow(22), 0, 0, 0, 'Pendente');
  add('Questoes', 'Pediatria', 'Pneumonia', daysFromNow(14), 0, 0, 0, 'Pendente');
  add('Questoes', 'Pediatria', 'Crupe', daysFromNow(22), 0, 0, 0, 'Pendente');
  add('Questoes', 'Preventiva', 'Vacinação', daysFromNow(18), 0, 0, 0, 'Pendente');
  add('Questoes', 'Clínica Médica', 'TEPT', daysAgo(5), 0, 0, 0, 'Atrasada');
  add('Questoes', 'Preventiva', 'Tuberculose', daysAgo(3), 0, 0, 0, 'Atrasada');

  return revisoes;
}

function makeSeedSimulados(): Simulado[] {
  return [
    {
      id: uuid(),
      titulo: 'ENAMED',
      ano: '2026',
      dataRealizacao: daysAgo(16),
      tempoGasto: 150,
      questoesTotal: 100,
      questoesAcertadas: 71,
      nota: 71,
      detalhePorArea: [
        { area: 'Clínica Médica', acertos: 24, total: 40 },
        { area: 'Cirurgia Geral', acertos: 26, total: 40 },
        { area: 'Ginecologia e Obstetrícia', acertos: 32, total: 40 },
        { area: 'Pediatria', acertos: 22, total: 40 },
        { area: 'Preventiva', acertos: 25, total: 40 },
      ],
    },
    {
      id: uuid(),
      titulo: 'Simulado Correção',
      ano: '2026',
      dataRealizacao: daysAgo(29),
      tempoGasto: 150,
      questoesTotal: 100,
      questoesAcertadas: 45,
      nota: 45,
      detalhePorArea: [
        { area: 'Clínica Médica', acertos: 18, total: 40 },
        { area: 'Cirurgia Geral', acertos: 20, total: 40 },
        { area: 'Ginecologia e Obstetrícia', acertos: 28, total: 40 },
        { area: 'Pediatria', acertos: 14, total: 40 },
        { area: 'Preventiva', acertos: 19, total: 40 },
      ],
    },
    {
      id: uuid(),
      titulo: 'Simulado Intensivo',
      ano: '2025',
      dataRealizacao: daysAgo(45),
      tempoGasto: 120,
      questoesTotal: 80,
      questoesAcertadas: 52,
      nota: 65,
      detalhePorArea: [
        { area: 'Clínica Médica', acertos: 20, total: 30 },
        { area: 'Pediatria', acertos: 18, total: 25 },
        { area: 'Preventiva', acertos: 14, total: 25 },
      ],
    },
  ];
}

function makeSeedTarefas(): Tarefa[] {
  const items = [
    { texto: 'revisar intoxicação por lítio', concluida: false },
    { texto: 'revisar intoxicação/abstinência', concluida: false },
    { texto: 'revisão uso de substâncias', concluida: false },
    { texto: 'revisar o diagnóstico de cada patologia', concluida: false },
    { texto: 'displasia broncopulmonar', concluida: false },
    { texto: 'atualização DPOC', concluida: false },
    { texto: 'atualização GINA', concluida: false },
    { texto: 'sedativos e anticonvulsivantes', concluida: false },
    { texto: 'flashcards classificação do RN', concluida: true },
    { texto: 'questões pneumonia', concluida: true },
    { texto: 'questões aleitamento', concluida: true },
    { texto: 'flashcards pneumonia', concluida: true },
    { texto: 'flashcards aleitamento', concluida: true },
    { texto: 'questões de reanimação', concluida: true },
    { texto: 'questões ITU', concluida: true },
    { texto: 'flashcards ITU', concluida: true },
  ];
  return items.map(i => ({ id: uuid(), createdAt: new Date().toISOString(), ...i }));
}

interface AppState {
  _seeded: boolean;
  usuario: { nome: string; tipo: string };
  revisoes: Revisao[];
  simulados: Simulado[];
  tarefas: Tarefa[];
  configAlgoritmo: ConfigAlgoritmo;
  metaSemanal: number;

  setUsuario: (u: { nome: string; tipo: string }) => void;
  addRevisao: (r: Omit<Revisao, 'id' | 'createdAt'>) => void;
  updateRevisao: (id: string, data: Partial<Revisao>) => void;
  deleteRevisao: (id: string) => void;
  concluirRevisao: (id: string, feitas: number, acertadas: number, tempo: number) => void;
  redistribuirAtrasadas: () => void;
  addSimulado: (s: Omit<Simulado, 'id'>) => void;
  deleteSimulado: (id: string) => void;
  addTarefa: (texto: string) => void;
  toggleTarefa: (id: string) => void;
  deleteTarefa: (id: string) => void;
  clearTarefasConcluidas: () => void;
  setConfigAlgoritmo: (c: ConfigAlgoritmo) => void;
  setMetaSemanal: (m: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      _seeded: false,
      usuario: { nome: 'Residente', tipo: 'R1' },
      revisoes: [],
      simulados: [],
      tarefas: [],
      configAlgoritmo: DEFAULT_CONFIG,
      metaSemanal: 150,

      setUsuario: (u) => set({ usuario: u }),

      addRevisao: (r) => {
        const id = uuid();
        set(s => ({ revisoes: [...s.revisoes, { ...r, id, createdAt: new Date().toISOString() }] }));
      },

      updateRevisao: (id, data) =>
        set(s => ({ revisoes: s.revisoes.map(r => r.id === id ? { ...r, ...data } : r) })),

      deleteRevisao: (id) =>
        set(s => ({ revisoes: s.revisoes.filter(r => r.id !== id) })),

      concluirRevisao: (id, feitas, acertadas, tempo) => {
        const { revisoes, configAlgoritmo } = get();
        const rev = revisoes.find(r => r.id === id);
        if (!rev) return;
        const ap = calcularAproveitamento(feitas, acertadas);
        const proxima = calcularProximaRevisao(ap, today(), configAlgoritmo);
        set(s => ({
          revisoes: [
            ...s.revisoes.map(r => r.id === id ? {
              ...r, status: 'Concluída' as const,
              questoesFeitas: feitas, questoesAcertadas: acertadas,
              aproveitamento: ap, tempoEstudo: tempo,
              dataRevisao: today(), proximaRevisao: proxima,
            } : r),
            ...(rev.gerarRevisaoInteligente ? [{
              id: uuid(), tipo: rev.tipo, grandeArea: rev.grandeArea,
              subArea: rev.subArea, dataRevisao: proxima, tempoEstudo: 0,
              questoesFeitas: 0, questoesAcertadas: 0, aproveitamento: 0,
              status: 'Pendente' as const, proximaRevisao: null,
              gerarRevisaoInteligente: true, createdAt: new Date().toISOString(),
            }] : []),
          ],
        }));
      },

      redistribuirAtrasadas: () => {
        const { revisoes } = get();
        const atrasadas = revisoes.filter(r =>
          (r.status === 'Pendente' || r.status === 'Atrasada') && isPast(r.dataRevisao)
        );
        if (!atrasadas.length) return;
        const perDay = Math.ceil(atrasadas.length / 7);
        const updated = revisoes.map(r => {
          const idx = atrasadas.findIndex(a => a.id === r.id);
          if (idx === -1) return r;
          const daysOffset = Math.floor(idx / perDay) + 1;
          return { ...r, dataRevisao: daysFromNow(daysOffset), status: 'Pendente' as const };
        });
        set({ revisoes: updated });
      },

      addSimulado: (s) =>
        set(st => ({ simulados: [{ ...s, id: uuid() }, ...st.simulados] })),

      deleteSimulado: (id) =>
        set(s => ({ simulados: s.simulados.filter(s => s.id !== id) })),

      addTarefa: (texto) =>
        set(s => ({
          tarefas: [{ id: uuid(), texto, concluida: false, createdAt: new Date().toISOString() }, ...s.tarefas],
        })),

      toggleTarefa: (id) =>
        set(s => ({ tarefas: s.tarefas.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t) })),

      deleteTarefa: (id) =>
        set(s => ({ tarefas: s.tarefas.filter(t => t.id !== id) })),

      clearTarefasConcluidas: () =>
        set(s => ({ tarefas: s.tarefas.filter(t => !t.concluida) })),

      setConfigAlgoritmo: (c) => set({ configAlgoritmo: c }),
      setMetaSemanal: (m) => set({ metaSemanal: m }),
    }),
    {
      name: 'dalk-store',
      onRehydrateStorage: () => (state) => {
        if (state && !state._seeded) {
          state.revisoes = makeSeedData();
          state.simulados = makeSeedSimulados();
          state.tarefas = makeSeedTarefas();
          state._seeded = true;
        }
      },
    }
  )
);
