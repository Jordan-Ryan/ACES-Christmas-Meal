import { useState, useEffect } from 'react';
import { fetchMenu, submitOrder } from '../api';
import type { Person, MenuData, Order, AdultOrder, KidsOrder } from '../types';

interface OrderFormProps {
  people: Person[];
  onOrderSubmitted: () => void;
  selectedPersonId?: number | null;
  onSelectedPersonChange?: (id: number | null) => void;
  onNavigateToResponses?: () => void;
}

const hasOrder = (person: Person): boolean => {
  if (!person.order) return false;
  if (person.isChild) {
    const order = person.order as { main?: string; sundayRoast?: string };
    return !!(order.main || order.sundayRoast); // Main or Sunday roast is required for kids
  } else {
    const order = person.order as { main?: string; sundayRoast?: string };
    return !!(order.main || order.sundayRoast); // Main or Sunday roast is required
  }
};

export function OrderForm({
  people,
  onOrderSubmitted,
  selectedPersonId: initialSelectedPersonId,
  onSelectedPersonChange,
  onNavigateToResponses,
}: OrderFormProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<number | ''>(
    (initialSelectedPersonId !== null && initialSelectedPersonId !== undefined) ? initialSelectedPersonId : ''
  );

  // Filter out people who have completed orders, unless one is pre-selected
  const hasPreSelectedPerson = (initialSelectedPersonId !== null && initialSelectedPersonId !== undefined) || (selectedPersonId !== '' && selectedPersonId !== null);
  const availablePeople = hasPreSelectedPerson
    ? people // Show all people if someone is pre-selected (for editing)
    : people.filter((person) => !hasOrder(person)); // Otherwise, only show people without orders
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [snack, setSnack] = useState('');
  const [starter, setStarter] = useState('');
  const [sundayRoast, setSundayRoast] = useState('');
  const [main, setMain] = useState('');
  const [sides, setSides] = useState<string[]>([]);
  const [dessert, setDessert] = useState('');
  const [kidsMain, setKidsMain] = useState('');
  const [kidsRoast, setKidsRoast] = useState('');
  const [kidsDessert, setKidsDessert] = useState('');
  const [notes, setNotes] = useState('');
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    fetchMenu().then(setMenu).catch((err) => {
      setError('Failed to load menu');
      console.error(err);
    });
  }, []);

  useEffect(() => {
    if (initialSelectedPersonId !== null && initialSelectedPersonId !== undefined) {
      setSelectedPersonId(initialSelectedPersonId);
    } else if (!selectedPersonId) {
      // Only clear if we don't have a selection and initial is cleared
      setSelectedPersonId('');
    }
  }, [initialSelectedPersonId]);

  useEffect(() => {
    if (selectedPersonId) {
      const person = people.find((p) => p.id === selectedPersonId);
      if (person) {
        if (person.isChild) {
          const order = person.order as KidsOrder | null;
          setKidsMain(order?.main || '');
          setKidsRoast(order?.sundayRoast || '');
          setKidsDessert(order?.dessert || '');
          setNotes(order?.notes || '');
          setSnack('');
          setStarter('');
          setSundayRoast('');
          setMain('');
          setSides([]);
          setDessert('');
        } else {
          const order = person.order as AdultOrder | null;
          // Check if starter is a snack
          const starterValue = order?.starter || '';
          if (menu) {
            const isSnack = menu.snacks.find(item => item.name === starterValue);
            if (isSnack) {
              setSnack(starterValue);
              setStarter('');
            } else {
              setSnack('');
              setStarter(starterValue);
            }
          } else {
            setSnack('');
            setStarter(starterValue);
          }
          setSundayRoast(order?.sundayRoast || '');
          setMain(order?.main || '');
          setSides(order?.sides || []);
          setDessert(order?.dessert || '');
          setNotes(order?.notes || '');
          setKidsMain('');
          setKidsRoast('');
          setKidsDessert('');
        }
        setHasPaid(person.hasPaid || false);
      }
    } else {
          setSnack('');
          setStarter('');
          setSundayRoast('');
          setMain('');
          setSides([]);
          setDessert('');
          setKidsMain('');
          setKidsRoast('');
          setKidsDessert('');
          setNotes('');
          setHasPaid(false);
    }
    setSuccess(false);
    setError(null);
  }, [selectedPersonId, people, menu]);

  const selectedPerson = people.find((p) => p.id === selectedPersonId);
  const isChild = selectedPerson?.isChild ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId) {
      setError('Please select a person');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let order: Order;
      if (isChild) {
        const mainOrRoast = kidsRoast || kidsMain;
        if (!mainOrRoast) {
          setError('Please select a main course or Sunday roast for the child');
          setLoading(false);
          return;
        }
        order = {
          main: kidsRoast ? undefined : kidsMain,
          sundayRoast: kidsRoast || undefined,
          dessert: kidsDessert || undefined,
          notes: notes || undefined,
        } as KidsOrder;
      } else {
        // Determine if main or sundayRoast should be used
        const mainOrRoast = sundayRoast || main;
        if (!mainOrRoast) {
          setError('Please select a main course or Sunday roast');
          setLoading(false);
          return;
        }
        // Combine snack and starter - snack takes precedence if selected
        const starterValue = snack || starter || undefined;
        order = {
          starter: starterValue,
          sundayRoast: sundayRoast || undefined,
          main: !sundayRoast ? (main || undefined) : undefined,
          sides: sides.length > 0 ? sides : undefined,
          dessert: dessert || undefined,
          notes: notes || undefined,
        } as AdultOrder;
      }

      await submitOrder({
        personId: selectedPersonId as number,
        order,
        hasPaid: isChild ? undefined : hasPaid,
        notes,
      });

      setSuccess(true);
      // Reload people data immediately
      onOrderSubmitted();
      // Navigate to responses view after showing success message
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        if (onSelectedPersonChange) {
          onSelectedPersonChange(null);
        }
        // Navigate to responses view
        if (onNavigateToResponses) {
          onNavigateToResponses();
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  if (!menu) {
    return <div className="loading">Loading menu...</div>;
  }

  const isEditing = hasPreSelectedPerson && (selectedPersonId !== '' && selectedPersonId !== null);

  // Helper function to find price of a menu item
  const findPrice = (category: keyof MenuData, itemName: string): number => {
    if (!menu) return 0;
    const items = menu[category];
    if (!items || !Array.isArray(items)) return 0;
    const item = items.find(item => item.name === itemName);
    return item?.price || 0;
  };

  // Calculate total price for current order
  const calculateTotal = (): number => {
    if (!menu) return 0;
    let total = 0;

    if (isChild) {
      if (kidsRoast) {
        total += findPrice('kidsRoasts', kidsRoast);
      } else if (kidsMain) {
        total += findPrice('kidsMains', kidsMain);
      }
      if (kidsDessert) {
        total += findPrice('kidsDesserts', kidsDessert);
      }
    } else {
      if (snack) {
        total += findPrice('snacks', snack);
      }
      if (starter) {
        total += findPrice('starters', starter);
      }
      if (sundayRoast) {
        total += findPrice('sundayRoasts', sundayRoast);
      } else if (main) {
        total += findPrice('mains', main);
      }
      if (sides.length > 0) {
        sides.forEach(side => {
          total += findPrice('sides', side);
        });
      }
      if (dessert) {
        total += findPrice('desserts', dessert);
      }
    }

    return total;
  };

  const totalPrice = calculateTotal();

  return (
    <div className="order-form-container">
      <h2>{isEditing ? 'Edit Your Order' : 'Place Your Order'}</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label htmlFor="person">Select Person:</label>
          <select
            id="person"
            value={selectedPersonId}
            onChange={(e) => {
              const newId = e.target.value ? Number(e.target.value) : '';
              setSelectedPersonId(newId);
              if (onSelectedPersonChange) {
                onSelectedPersonChange(newId ? newId : null);
              }
            }}
            required
          >
            <option value="">-- Choose a person --</option>
            {availablePeople.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} {person.isChild ? '(C)' : ''} {person.hasPaid ? '💵' : ''}
              </option>
            ))}
          </select>
          {availablePeople.length === 0 && !hasPreSelectedPerson && (
            <p className="info-message">
              All orders have been placed. Click on a name in the View Orders tab to edit an existing order.
            </p>
          )}
        </div>

        {selectedPersonId && (
          <>
            {isChild ? (
              <>
                <div className="form-group">
                  <label htmlFor="kids-roast">Kids Sunday Roast:</label>
                  <select
                    id="kids-roast"
                    value={kidsRoast}
                    onChange={(e) => {
                      setKidsRoast(e.target.value);
                      if (e.target.value) setKidsMain('');
                    }}
                  >
                    <option value="">-- None --</option>
                    {menu.kidsRoasts.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} - £{item.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="kids-main">Kids Main:</label>
                  <select
                    id="kids-main"
                    value={kidsMain}
                    onChange={(e) => {
                      setKidsMain(e.target.value);
                      if (e.target.value) setKidsRoast('');
                    }}
                    required={!kidsRoast}
                  >
                    <option value="">-- Select a main --</option>
                    {menu.kidsMains.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} - £{item.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="kids-dessert">Kids Dessert:</label>
                  <select
                    id="kids-dessert"
                    value={kidsDessert}
                    onChange={(e) => setKidsDessert(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {menu.kidsDesserts.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} - £{item.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                {menu.snacks.length > 0 && (
                  <div className="form-group">
                    <label htmlFor="snack">Snacks:</label>
                    <select
                      id="snack"
                      value={snack}
                      onChange={(e) => setSnack(e.target.value)}
                    >
                    <option value="">-- None --</option>
                    {menu.snacks.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} - £{item.price.toFixed(2)}
                      </option>
                    ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="starter">Starters:</label>
                  <select
                    id="starter"
                    value={starter}
                    onChange={(e) => setStarter(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {menu.starters.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} - £{item.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sundayRoast">
                    Sunday Roasts:
                    <span className="menu-note"> (includes bottomless sides: Yorkshire pudding, pigs in blankets, roast potatoes, cauliflower cheese, carrots, greens and gravy)</span>
                  </label>
                  <select
                    id="sundayRoast"
                    value={sundayRoast}
                    onChange={(e) => {
                      setSundayRoast(e.target.value);
                      if (e.target.value) setMain('');
                    }}
                  >
                    <option value="">-- None --</option>
                    {menu.sundayRoasts.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} - £{item.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="main">Mains:</label>
                  <select
                    id="main"
                    value={main}
                    onChange={(e) => {
                      setMain(e.target.value);
                      if (e.target.value) setSundayRoast('');
                    }}
                  >
                    <option value="">-- None --</option>
                    {menu.mains.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} - £{item.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {menu.sides.length > 0 && (
                  <div className="form-group">
                    <label>Sides:</label>
                    <div className="sides-container">
                      {menu.sides.map((item) => (
                        <label key={item.name} className="side-checkbox-label">
                          <input
                            type="checkbox"
                            checked={sides.includes(item.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSides([...sides, item.name]);
                              } else {
                                setSides(sides.filter((s) => s !== item.name));
                              }
                            }}
                          />
                          <span>{item.name} - £{item.price.toFixed(2)}</span>
                        </label>
                      ))}
                    </div>
                    {sides.length > 0 && (
                      <div className="selected-sides">
                        Selected: {sides.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="dessert">Desserts:</label>
                  <select
                    id="dessert"
                    value={dessert}
                    onChange={(e) => setDessert(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {menu.desserts.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} - £{item.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes / Special Requests:</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Custard on sticky toffee pudding, no onions, etc."
                    rows={3}
                    className="notes-textarea"
                  />
                </div>
              </>
            )}

            {isChild && (
              <div className="form-group">
                <label htmlFor="notes-kids">Notes / Special Requests:</label>
                <textarea
                  id="notes-kids"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., No peas, extra chips, etc."
                  rows={3}
                  className="notes-textarea"
                />
              </div>
            )}

            {!isChild && (
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasPaid}
                    onChange={(e) => setHasPaid(e.target.checked)}
                  />
                  <span>Paid (Deposit)</span>
                </label>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Order submitted successfully!</div>}

            <div className="total-price-display">
              <strong>Total: £{totalPrice.toFixed(2)}</strong>
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (
                <span className="button-loading">
                  <span className="spinner"></span>
                  Submitting...
                </span>
              ) : (
                'Submit Order'
              )}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

