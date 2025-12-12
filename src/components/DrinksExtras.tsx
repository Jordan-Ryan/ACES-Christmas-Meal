import { useState, useEffect } from 'react';
import { fetchResponses, fetchDrinks, updatePersonExtras } from '../api';
import type { Person, DrinkItem, ExtraItem } from '../types';

export function DrinksExtras() {
  const [people, setPeople] = useState<Person[]>([]);
  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | ''>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [peopleData, drinksData] = await Promise.all([
        fetchResponses(),
        fetchDrinks(),
      ]);
      setPeople(peopleData.people);
      setDrinks(drinksData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPersonExtras = (person: Person): ExtraItem[] => {
    return person.extras || [];
  };

  const getQuantity = (person: Person, drinkId: string): number => {
    const extra = getPersonExtras(person).find(e => e.drinkId === drinkId);
    return extra?.quantity || 0;
  };

  const updateQuantity = async (personId: number, drinkId: string, delta: number) => {
    const person = people.find(p => p.id === personId);
    if (!person) return;

    const currentExtras = getPersonExtras(person);
    const existingIndex = currentExtras.findIndex(e => e.drinkId === drinkId);
    
    let newExtras: ExtraItem[];
    if (existingIndex >= 0) {
      const newQuantity = currentExtras[existingIndex].quantity + delta;
      if (newQuantity <= 0) {
        newExtras = currentExtras.filter(e => e.drinkId !== drinkId);
      } else {
        newExtras = [...currentExtras];
        newExtras[existingIndex] = { ...newExtras[existingIndex], quantity: newQuantity };
      }
    } else {
      if (delta > 0) {
        newExtras = [...currentExtras, { drinkId, quantity: delta }];
      } else {
        newExtras = currentExtras;
      }
    }

    try {
      setError(null);
      await updatePersonExtras(personId, newExtras);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update extras');
    }
  };

  const getPersonTotal = (person: Person): number => {
    const extras = getPersonExtras(person);
    return extras.reduce((total, extra) => {
      const drink = drinks.find(d => d.id === extra.drinkId);
      return total + (drink ? drink.price * extra.quantity : 0);
    }, 0);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const selectedPerson = selectedPersonId ? people.find(p => p.id === selectedPersonId) : null;

  return (
    <div className="drinks-extras-container">
      <h2>Drinks & Extras</h2>

      {error && <div className="error-message">{error}</div>}

      {drinks.length === 0 ? (
        <div className="info-message">
          <p>No drinks available. Please add drinks in the "Manage Drinks" tab first.</p>
        </div>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="select-person">Select Person:</label>
            <select
              id="select-person"
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">-- Choose a person --</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} {person.isChild ? '(C)' : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedPerson && (
            <div className="person-extras-section">
              <h3>{selectedPerson.name}'s Drinks & Extras</h3>
              
              <div className="drinks-selection">
                {drinks.map((drink) => {
                  const quantity = getQuantity(selectedPerson, drink.id);
                  return (
                    <div key={drink.id} className="drink-selection-item">
                      <div className="drink-info">
                        <strong>{drink.name}</strong>
                        <span className="drink-price">£{drink.price.toFixed(2)}</span>
                      </div>
                      <div className="drink-selection-controls">
                        <div className="quantity-controls">
                          <button
                            type="button"
                            onClick={() => updateQuantity(selectedPerson.id, drink.id, -1)}
                            disabled={quantity === 0}
                            className="quantity-button"
                          >
                            −
                          </button>
                          <span className="quantity-display">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(selectedPerson.id, drink.id, 1)}
                            className="quantity-button"
                          >
                            +
                          </button>
                        </div>
                        <div className="item-total">
                          {quantity > 0 && (
                            <span>Subtotal: £{(drink.price * quantity).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="person-extras-total">
                <strong>Total: £{getPersonTotal(selectedPerson).toFixed(2)}</strong>
              </div>
            </div>
          )}

          <div className="all-people-summary">
            <h3>Summary</h3>
            {people.map((person) => {
              const total = getPersonTotal(person);
              const extras = getPersonExtras(person);
              if (extras.length === 0) return null;
              
              return (
                <div key={person.id} className="summary-item">
                  <span>{person.name}:</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

