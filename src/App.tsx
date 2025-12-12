import { useState, useEffect } from 'react';
import { OrderForm } from './components/OrderForm';
import { ResponsesView } from './components/ResponsesView';
import { ManageDrinks } from './components/ManageDrinks';
import { DrinksExtras } from './components/DrinksExtras';
import { Receipt } from './components/Receipt';
import { ToBePaid } from './components/ToBePaid';
import { fetchResponses } from './api';
import type { Person } from './types';

type View = 'form' | 'responses' | 'manageDrinks' | 'drinksExtras' | 'receipt' | 'toBePaid';

function App() {
  const [currentView, setCurrentView] = useState<View>('form');
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  const loadPeople = async () => {
    try {
      const data = await fetchResponses();
      setPeople(data.people);
    } catch (err) {
      console.error('Failed to load people:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeople();
  }, []);

  const handleOrderSubmitted = () => {
    loadPeople();
    setSelectedPersonId(null);
  };

  const handlePersonClick = (personId: number) => {
    setSelectedPersonId(personId);
    setCurrentView('form');
    // Reload people data to ensure we have the latest info
    loadPeople();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>ACES Christmas Meal</h1>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${currentView === 'form' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('form');
              if (currentView === 'responses' && !selectedPersonId) {
                setSelectedPersonId(null);
              }
            }}
          >
            Order Form
          </button>
          <button
            className={`nav-tab ${currentView === 'responses' ? 'active' : ''}`}
            onClick={() => setCurrentView('responses')}
          >
            View Orders
          </button>
          <button
            className={`nav-tab ${currentView === 'manageDrinks' ? 'active' : ''}`}
            onClick={() => setCurrentView('manageDrinks')}
          >
            Manage Extras
          </button>
          <button
            className={`nav-tab ${currentView === 'drinksExtras' ? 'active' : ''}`}
            onClick={() => setCurrentView('drinksExtras')}
          >
            Drinks & Extras
          </button>
          <button
            className={`nav-tab ${currentView === 'receipt' ? 'active' : ''}`}
            onClick={() => setCurrentView('receipt')}
          >
            Receipt
          </button>
          <button
            className={`nav-tab ${currentView === 'toBePaid' ? 'active' : ''}`}
            onClick={() => setCurrentView('toBePaid')}
          >
            To Be Paid
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'form' && (
          <OrderForm
            people={people}
            onOrderSubmitted={handleOrderSubmitted}
            selectedPersonId={selectedPersonId}
            onSelectedPersonChange={setSelectedPersonId}
            onNavigateToResponses={() => setCurrentView('responses')}
          />
        )}
        {currentView === 'responses' && (
          <ResponsesView onPersonClick={handlePersonClick} />
        )}
        {currentView === 'manageDrinks' && (
          <ManageDrinks />
        )}
        {currentView === 'drinksExtras' && (
          <DrinksExtras />
        )}
        {currentView === 'receipt' && (
          <Receipt />
        )}
        {currentView === 'toBePaid' && (
          <ToBePaid />
        )}
      </main>
    </div>
  );
}

export default App;

