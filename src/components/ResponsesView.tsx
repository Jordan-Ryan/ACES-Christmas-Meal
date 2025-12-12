import { useState, useEffect } from 'react';
import { fetchResponses, fetchMenu } from '../api';
import type { Person, AdultOrder, KidsOrder, MenuData } from '../types';
import * as XLSX from 'xlsx';

interface ResponsesViewProps {
  onPersonClick?: (personId: number) => void;
}

export function ResponsesView({ onPersonClick }: ResponsesViewProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadResponses = async () => {
    try {
      setLoading(true);
      const data = await fetchResponses();
      setPeople(data.people);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load responses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponses();
    fetchMenu().then(setMenu).catch((err) => {
      console.error('Failed to load menu:', err);
    });
  }, []);

  // Helper function to find price
  const findPrice = (category: keyof MenuData, itemName: string): number => {
    if (!menu) return 0;
    const items = menu[category];
    if (!items || !Array.isArray(items)) return 0;
    const item = items.find(item => item.name === itemName);
    return item?.price || 0;
  };

  // Calculate total for a person's order
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
        // Check if it's a snack or starter
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

    return total;
  };

  const hasOrder = (person: Person): boolean => {
    if (!person.order) return false;
    if (person.isChild) {
      const order = person.order as KidsOrder;
      return !!order.main; // Main is required for kids
    } else {
      const order = person.order as AdultOrder;
      return !!(order.main || order.sundayRoast); // Main or Sunday roast is required
    }
  };

  const exportToExcel = () => {
    const worksheetData = people.map((person, index) => {
      const order = person.order;
      if (person.isChild) {
        const kidsOrder = order as KidsOrder | null;
        return {
          '#': index + 1,
          Name: person.name,
          'Is Child': 'Yes',
          'Kids Main': kidsOrder?.main || '',
          'Kids Dessert': kidsOrder?.dessert || '',
          Notes: kidsOrder?.notes || '',
          Status: hasOrder(person) ? 'Completed' : 'Pending',
        };
      } else {
        const adultOrder = order as AdultOrder | null;
        return {
          '#': index + 1,
          Name: person.name,
          'Is Child': 'No',
          Starter: adultOrder?.starter || '',
          'Sunday Roast': adultOrder?.sundayRoast || '',
          Main: adultOrder?.main || '',
          Sides: adultOrder?.sides?.join(', ') || '',
          Dessert: adultOrder?.dessert || '',
          Notes: adultOrder?.notes || '',
          'Total Price': menu ? `£${calculatePersonTotal(person).toFixed(2)}` : '',
          Status: hasOrder(person) ? 'Completed' : 'Pending',
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Auto-size columns
    const maxWidth = worksheetData.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
    worksheet['!cols'] = Array.from({ length: maxWidth }, () => ({ wch: 20 }));

    const fileName = `ACES-Christmas-Meal-Orders-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading && people.length === 0) {
    return <div className="loading">Loading responses...</div>;
  }

  return (
    <div className="responses-view-container">
      <div className="responses-header">
        <h2>Sunday Lunch Pre-Order</h2>
        <div className="header-actions">
          <button onClick={exportToExcel} className="export-button">
            Export to Excel
          </button>
          <button onClick={loadResponses} className="refresh-button" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="responses-list">
        {people.map((person, index) => {
          const completed = hasOrder(person);
          const order = person.order;

          return (
            <div
              key={person.id}
              className={`response-item ${completed ? 'completed' : 'pending'}`}
            >
              <div className="response-number">{index + 1}.</div>
              <div className="response-content">
                <div className="response-name">
                  <span
                    className={`name-text ${completed && onPersonClick ? 'clickable-name' : ''}`}
                    onClick={() => {
                      if (completed && onPersonClick) {
                        onPersonClick(person.id);
                      }
                    }}
                    title={completed && onPersonClick ? 'Click to edit order' : ''}
                  >
                    {person.name}
                  </span>
                  {person.isChild && <span className="child-badge">(C)</span>}
                  {person.hasPaid && <span className="paid-badge">Paid</span>}
                  {completed && <span className="checkmark">✓</span>}
                  {completed && onPersonClick && (
                    <span className="edit-hint">(click to edit)</span>
                  )}
                </div>
                <div className="response-order">
                  {person.isChild ? (
                    <div>
                      {!hasOrder(person) ? (
                        <div>
                          <span className="empty">No order placed yet</span>
                        </div>
                      ) : (
                        <>
                          {(order as KidsOrder | null)?.sundayRoast && (
                            <div>
                              <strong>Sunday Roast:</strong>{' '}
                              {(order as KidsOrder | null)?.sundayRoast}
                              {menu && (
                                <span className="price-badge">
                                  {' '}£{findPrice('kidsRoasts', (order as KidsOrder).sundayRoast!).toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                          {(order as KidsOrder | null)?.main && (
                            <div>
                              <strong>Main:</strong>{' '}
                              {(order as KidsOrder | null)?.main}
                              {menu && (
                                <span className="price-badge">
                                  {' '}£{findPrice('kidsMains', (order as KidsOrder).main!).toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                          {(order as KidsOrder | null)?.dessert && (
                            <div>
                              <strong>Dessert:</strong>{' '}
                              {(order as KidsOrder | null)?.dessert}
                              {menu && (
                                <span className="price-badge">
                                  {' '}£{findPrice('kidsDesserts', (order as KidsOrder).dessert!).toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                          {(order as KidsOrder | null)?.notes && (
                            <div className="notes-display">
                              <strong>Notes:</strong>{' '}
                              <span className="notes-text">{(order as KidsOrder | null)?.notes}</span>
                            </div>
                          )}
                          <div className="person-total">
                            <strong>Total: £{calculatePersonTotal(person).toFixed(2)}</strong>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div>
                      {!hasOrder(person) ? (
                        <div>
                          <span className="empty">No order placed yet</span>
                        </div>
                      ) : (
                        <>
                          {(order as AdultOrder | null)?.starter && (
                            <div>
                              <strong>Starter:</strong>{' '}
                              {(order as AdultOrder | null)?.starter}
                              {menu && (() => {
                                const starterName = (order as AdultOrder).starter!;
                                const snackPrice = findPrice('snacks', starterName);
                                const starterPrice = findPrice('starters', starterName);
                                const price = snackPrice || starterPrice;
                                return price > 0 ? (
                                  <span className="price-badge"> £{price.toFixed(2)}</span>
                                ) : null;
                              })()}
                            </div>
                          )}
                          {(order as AdultOrder | null)?.sundayRoast && (
                            <div>
                              <strong>Sunday Roast:</strong>{' '}
                              {(order as AdultOrder | null)?.sundayRoast}
                              {menu && (
                                <span className="price-badge">
                                  {' '}£{findPrice('sundayRoasts', (order as AdultOrder).sundayRoast!).toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                          {(order as AdultOrder | null)?.main && (
                            <div>
                              <strong>Main:</strong>{' '}
                              {(order as AdultOrder | null)?.main}
                              {menu && (
                                <span className="price-badge">
                                  {' '}£{findPrice('mains', (order as AdultOrder).main!).toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                          {(() => {
                            const adultOrder = order as AdultOrder | null;
                            const sides = adultOrder?.sides;
                            return sides && sides.length > 0 ? (
                              <div>
                                <strong>Sides:</strong> {sides.map(side => {
                                  const price = menu ? findPrice('sides', side) : 0;
                                  return price > 0 ? `${side} (£${price.toFixed(2)})` : side;
                                }).join(', ')}
                              </div>
                            ) : null;
                          })()}
                          {(order as AdultOrder | null)?.dessert && (
                            <div>
                              <strong>Dessert:</strong>{' '}
                              {(order as AdultOrder | null)?.dessert}
                              {menu && (
                                <span className="price-badge">
                                  {' '}£{findPrice('desserts', (order as AdultOrder).dessert!).toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                          {(order as AdultOrder | null)?.notes && (
                            <div className="notes-display">
                              <strong>Notes:</strong>{' '}
                              <span className="notes-text">{(order as AdultOrder | null)?.notes}</span>
                            </div>
                          )}
                          <div className="person-total">
                            <strong>Total: £{calculatePersonTotal(person).toFixed(2)}</strong>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="summary">
        <div className="summary-item">
          <strong>Total:</strong> {people.length} people
        </div>
        <div className="summary-item">
          <strong>Completed:</strong>{' '}
          <span className="completed-count">
            {people.filter(hasOrder).length}
          </span>
        </div>
        <div className="summary-item">
          <strong>Pending:</strong>{' '}
          <span className="pending-count">
            {people.filter((p) => !hasOrder(p)).length}
          </span>
        </div>
      </div>
    </div>
  );
}

