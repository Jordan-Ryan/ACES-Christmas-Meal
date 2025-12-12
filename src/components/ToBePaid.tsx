import { useState, useEffect } from 'react';
import { fetchResponses, fetchMenu, fetchDrinks } from '../api';
import type { Person, MenuData, DrinkItem, AdultOrder, KidsOrder } from '../types';

export function ToBePaid() {
  const [people, setPeople] = useState<Person[]>([]);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceCharge, setServiceCharge] = useState(12.5);
  const [selectedPersonIds, setSelectedPersonIds] = useState<number[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [peopleData, menuData, drinksData] = await Promise.all([
        fetchResponses(),
        fetchMenu(),
        fetchDrinks(),
      ]);
      setPeople(peopleData.people);
      setMenu(menuData);
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

  const findPrice = (category: keyof MenuData, itemName: string): number => {
    if (!menu) return 0;
    const items = menu[category];
    if (!items || !Array.isArray(items)) return 0;
    const item = items.find(item => item.name === itemName);
    return item?.price || 0;
  };

  const calculatePersonSubtotal = (person: Person): number => {
    if (!person.order || !menu) return 0;
    let total = 0;

    if (person.isChild) {
      const order = person.order as KidsOrder;
      if (order.sundayRoast) {
        total += findPrice('kidsRoasts', order.sundayRoast);
      } else if (order.main) {
        total += findPrice('kidsMains', order.main);
      }
      if (order.dessert) {
        total += findPrice('kidsDesserts', order.dessert);
      }
    } else {
      const order = person.order as AdultOrder;
      if (order.starter) {
        const snackPrice = findPrice('snacks', order.starter);
        const starterPrice = findPrice('starters', order.starter);
        total += snackPrice || starterPrice;
      }
      if (order.sundayRoast) {
        total += findPrice('sundayRoasts', order.sundayRoast);
      } else if (order.main) {
        total += findPrice('mains', order.main);
      }
      if (order.sides && order.sides.length > 0) {
        order.sides.forEach(side => {
          total += findPrice('sides', side);
        });
      }
      if (order.dessert) {
        total += findPrice('desserts', order.dessert);
      }
    }

    if (person.extras && person.extras.length > 0) {
      person.extras.forEach(extra => {
        const drink = drinks.find(d => d.id === extra.drinkId);
        if (drink) {
          total += drink.price * extra.quantity;
        }
      });
    }

    return total;
  };

  const calculatePersonTotal = (person: Person): number => {
    const subtotal = calculatePersonSubtotal(person);
    if (subtotal === 0) return 0; // No order, no total
    
    const deposit = person.isChild ? 0 : 15; // £15 deposit for adults only
    const amountAfterDeposit = Math.max(0, subtotal - deposit); // Ensure non-negative
    const serviceChargeAmount = (amountAfterDeposit * serviceCharge) / 100;
    return amountAfterDeposit + serviceChargeAmount;
  };

  const calculatePersonBreakdown = (person: Person) => {
    const subtotal = calculatePersonSubtotal(person);
    if (subtotal === 0) {
      return { subtotal: 0, deposit: 0, amountAfterDeposit: 0, serviceChargeAmount: 0, total: 0 };
    }
    const deposit = person.isChild ? 0 : 15;
    const amountAfterDeposit = Math.max(0, subtotal - deposit);
    const serviceChargeAmount = (amountAfterDeposit * serviceCharge) / 100;
    const total = amountAfterDeposit + serviceChargeAmount;
    return { subtotal, deposit, amountAfterDeposit, serviceChargeAmount, total };
  };

  const handlePersonToggle = (personId: number) => {
    setSelectedPersonIds(prev => {
      if (prev.includes(personId)) {
        return prev.filter(id => id !== personId);
      } else {
        return [...prev, personId];
      }
    });
  };

  const handleSelectAll = () => {
    const peopleWithOrders = people.filter(p => calculatePersonTotal(p) > 0);
    setSelectedPersonIds(peopleWithOrders.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPersonIds([]);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const selectedPeople = people.filter(p => selectedPersonIds.includes(p.id));
  const selectedTotal = selectedPeople.reduce((total, person) => total + calculatePersonTotal(person), 0);
  const selectedSubtotal = selectedPeople.reduce((total, person) => total + calculatePersonSubtotal(person), 0);
  const selectedDeposit = selectedPeople.reduce((total, person) => total + (person.isChild ? 0 : 15), 0);
  const selectedAmountAfterDeposit = selectedSubtotal - selectedDeposit;
  const selectedServiceCharge = (selectedAmountAfterDeposit * serviceCharge) / 100;

  return (
    <div className="to-be-paid-container">
      <h2>To Be Paid</h2>

      <div className="service-charge-control">
        <label htmlFor="service-charge">Service Charge (%):</label>
        <input
          id="service-charge"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={serviceCharge}
          onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="person-selection-section">
        <div className="selection-controls">
          <button onClick={handleSelectAll} className="select-button">Select All</button>
          <button onClick={handleDeselectAll} className="select-button">Deselect All</button>
        </div>

        <div className="person-checkboxes">
          {people.map((person) => {
            const subtotal = calculatePersonSubtotal(person);
            if (subtotal === 0) return null; // Only show people who have ordered
            
            const total = calculatePersonTotal(person);
            
            return (
              <label key={person.id} className="person-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedPersonIds.includes(person.id)}
                  onChange={() => handlePersonToggle(person.id)}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', width: '100%' }}>
                  <span>{person.name}{person.isChild && <span className="child-badge">(C)</span>}</span>
                  <span className="person-preview-total">£{total.toFixed(2)}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {selectedPeople.length > 0 && (
        <div className="selected-people-breakdown">
          <h3>Payment Breakdown</h3>
          
          <div className="breakdown-list">
            {selectedPeople.map((person) => {
              const { subtotal, deposit, amountAfterDeposit, serviceChargeAmount, total } = calculatePersonBreakdown(person);
              
              return (
                <div key={person.id} className="breakdown-item">
                  <div className="breakdown-person-header">
                    <strong>{person.name}</strong> {person.isChild && <span className="child-badge">(C)</span>}
                  </div>
                  <div className="breakdown-details">
                    <div className="breakdown-line">
                      <span>Subtotal:</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    {deposit > 0 && (
                      <div className="breakdown-line">
                        <span>Deposit Paid:</span>
                        <span>-£{deposit.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="breakdown-line">
                      <span>After Deposit:</span>
                      <span>£{amountAfterDeposit.toFixed(2)}</span>
                    </div>
                    <div className="breakdown-line">
                      <span>Service Charge ({serviceCharge}%):</span>
                      <span>£{serviceChargeAmount.toFixed(2)}</span>
                    </div>
                    <div className="breakdown-line breakdown-total">
                      <strong>Total to Pay:</strong>
                      <strong>£{total.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="selected-totals">
            <div className="total-line">
              <span>Subtotal ({selectedPeople.length} {selectedPeople.length === 1 ? 'person' : 'people'}):</span>
              <span>£{selectedSubtotal.toFixed(2)}</span>
            </div>
            {selectedDeposit > 0 && (
              <div className="total-line">
                <span>Deposits Paid:</span>
                <span>-£{selectedDeposit.toFixed(2)}</span>
              </div>
            )}
            <div className="total-line">
              <span>After Deposits:</span>
              <span>£{selectedAmountAfterDeposit.toFixed(2)}</span>
            </div>
            <div className="total-line">
              <span>Service Charge ({serviceCharge}%):</span>
              <span>£{selectedServiceCharge.toFixed(2)}</span>
            </div>
            <div className="total-line grand-total">
              <strong>Grand Total to Pay:</strong>
              <strong>£{selectedTotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}

      {selectedPeople.length === 0 && (
        <div className="info-message">
          <p>Select people above to see their payment breakdown.</p>
        </div>
      )}
    </div>
  );
}
