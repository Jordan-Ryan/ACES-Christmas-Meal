import { useState, useEffect } from 'react';
import { fetchResponses, fetchMenu, fetchDrinks } from '../api';
import type { Person, MenuData, DrinkItem, AdultOrder, KidsOrder } from '../types';

export function Receipt() {
  const [people, setPeople] = useState<Person[]>([]);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceCharge, setServiceCharge] = useState(12.5);

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

  const calculatePersonTotal = (person: Person): number => {
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

    // Add drinks/extras
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

  const calculateSubtotal = (): number => {
    return people.reduce((total, person) => total + calculatePersonTotal(person), 0);
  };

  const calculateServiceCharge = (): number => {
    const subtotal = calculateSubtotal();
    return (subtotal * serviceCharge) / 100;
  };

  const calculateGrandTotal = (): number => {
    return calculateSubtotal() + calculateServiceCharge();
  };

  if (loading) {
    return <div className="loading">Loading receipt...</div>;
  }

  const subtotal = calculateSubtotal();
  const serviceChargeAmount = calculateServiceCharge();
  const grandTotal = calculateGrandTotal();

  return (
    <div className="receipt-container">
      <h2>Receipt</h2>

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

      <div className="receipt-items">
        {people.map((person) => {
          const personTotal = calculatePersonTotal(person);
          if (personTotal === 0) return null;

          return (
            <div key={person.id} className="receipt-person">
              <div className="receipt-person-header">
                <h3>{person.name} {person.isChild && <span className="child-badge">(C)</span>}</h3>
              </div>
              <div className="receipt-person-items">
                {person.order && (
                  <>
                    {person.isChild ? (
                      <>
                        {(person.order as KidsOrder).sundayRoast && (
                          <div className="receipt-item">
                            <span>Sunday Roast: {(person.order as KidsOrder).sundayRoast}</span>
                            <span>£{findPrice('kidsRoasts', (person.order as KidsOrder).sundayRoast!).toFixed(2)}</span>
                          </div>
                        )}
                        {(person.order as KidsOrder).main && (
                          <div className="receipt-item">
                            <span>Main: {(person.order as KidsOrder).main}</span>
                            <span>£{findPrice('kidsMains', (person.order as KidsOrder).main!).toFixed(2)}</span>
                          </div>
                        )}
                        {(person.order as KidsOrder).dessert && (
                          <div className="receipt-item">
                            <span>Dessert: {(person.order as KidsOrder).dessert}</span>
                            <span>£{findPrice('kidsDesserts', (person.order as KidsOrder).dessert!).toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {(person.order as AdultOrder).starter && (
                          <div className="receipt-item">
                            <span>Starter: {(person.order as AdultOrder).starter}</span>
                            <span>£{(() => {
                              const starterName = (person.order as AdultOrder).starter!;
                              const snackPrice = findPrice('snacks', starterName);
                              const starterPrice = findPrice('starters', starterName);
                              return (snackPrice || starterPrice).toFixed(2);
                            })()}</span>
                          </div>
                        )}
                        {(person.order as AdultOrder).sundayRoast && (
                          <div className="receipt-item">
                            <span>Sunday Roast: {(person.order as AdultOrder).sundayRoast}</span>
                            <span>£{findPrice('sundayRoasts', (person.order as AdultOrder).sundayRoast!).toFixed(2)}</span>
                          </div>
                        )}
                        {(person.order as AdultOrder).main && (
                          <div className="receipt-item">
                            <span>Main: {(person.order as AdultOrder).main}</span>
                            <span>£{findPrice('mains', (person.order as AdultOrder).main!).toFixed(2)}</span>
                          </div>
                        )}
                        {(person.order as AdultOrder).sides && (person.order as AdultOrder).sides!.length > 0 && (
                          <div className="receipt-item">
                            <span>Sides: {(person.order as AdultOrder).sides!.join(', ')}</span>
                            <span>£{(() => {
                              const sides = (person.order as AdultOrder).sides!;
                              return sides.reduce((sum, side) => sum + findPrice('sides', side), 0).toFixed(2);
                            })()}</span>
                          </div>
                        )}
                        {(person.order as AdultOrder).dessert && (
                          <div className="receipt-item">
                            <span>Dessert: {(person.order as AdultOrder).dessert}</span>
                            <span>£{findPrice('desserts', (person.order as AdultOrder).dessert!).toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                {person.extras && person.extras.length > 0 && (
                  <>
                    {person.extras.map((extra, idx) => {
                      const drink = drinks.find(d => d.id === extra.drinkId);
                      if (!drink) return null;
                      return (
                        <div key={idx} className="receipt-item">
                          <span>{drink.name} x{extra.quantity}</span>
                          <span>£{(drink.price * extra.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="receipt-person-total">
                <div className="receipt-person-subtotal">
                  <span>Subtotal:</span>
                  <span>£{personTotal.toFixed(2)}</span>
                </div>
                {(() => {
                  const personSubtotal = personTotal;
                  const personServiceCharge = (personSubtotal * serviceCharge) / 100;
                  const personTotalWithService = personSubtotal + personServiceCharge;
                  return (
                    <>
                      <div className="receipt-person-service">
                        <span>Service Charge ({serviceCharge}%):</span>
                        <span>£{personServiceCharge.toFixed(2)}</span>
                      </div>
                      <div className="receipt-person-grand-total">
                        <strong>Total:</strong>
                        <strong>£{personTotalWithService.toFixed(2)}</strong>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="receipt-totals">
        <div className="receipt-total-line">
          <span>Subtotal:</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        <div className="receipt-total-line">
          <span>Service Charge ({serviceCharge}%):</span>
          <span>£{serviceChargeAmount.toFixed(2)}</span>
        </div>
        <div className="receipt-total-line grand-total">
          <span>Grand Total:</span>
          <span>£{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

