import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AddRevisaoModal } from './components/modals/AddRevisaoModal';
import { Dashboard } from './pages/Dashboard';
import { Desempenho } from './pages/Desempenho';
import { Historico } from './pages/Historico';
import { Simulados } from './pages/Simulados';
import { Calendario } from './pages/Calendario';
import { FocoProva } from './pages/FocoProva';
import { TodoPomodoro } from './pages/TodoPomodoro';
import { ConfigRevisao } from './pages/ConfigRevisao';

export default function App() {
  const [addRevisaoOpen, setAddRevisaoOpen] = useState(false);
  const [addFlashcardOpen, setAddFlashcardOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0a0c14]">
        <Sidebar
          onAddRevisao={() => setAddRevisaoOpen(true)}
          onAddFlashcard={() => setAddFlashcardOpen(true)}
        />

        <div className="ml-52 flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/desempenho" element={<Desempenho />} />
              <Route path="/historico"  element={<Historico />} />
              <Route path="/simulados"  element={<Simulados />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/foco-prova" element={<FocoProva />} />
              <Route path="/todo"       element={<TodoPomodoro />} />
              <Route path="/config"     element={<ConfigRevisao />} />
            </Routes>
          </main>
        </div>
      </div>

      <AddRevisaoModal
        open={addRevisaoOpen}
        onClose={() => setAddRevisaoOpen(false)}
      />
      <AddRevisaoModal
        open={addFlashcardOpen}
        onClose={() => setAddFlashcardOpen(false)}
        defaultTipo="Flashcards"
      />
    </BrowserRouter>
  );
}
