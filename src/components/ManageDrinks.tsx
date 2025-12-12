import { useState, useEffect } from 'react';
import { fetchDrinks, addDrink, updateDrink, deleteDrink } from '../api';
import type { DrinkItem } from '../types';

export function ManageDrinks() {
  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '' });

  const loadDrinks = async () => {
    try {
      setLoading(true);
      const data = await fetchDrinks();
      setDrinks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load extras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrinks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        setError('Please enter a valid price');
        return;
      }

      await addDrink({ name: formData.name, price });
      setFormData({ name: '', price: '' });
      setError(null);
      loadDrinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add extra');
    }
  };

  const handleEdit = (drink: DrinkItem) => {
    setEditingId(drink.id);
    setFormData({ name: drink.name, price: drink.price.toString() });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formData.name || !formData.price) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        setError('Please enter a valid price');
        return;
      }

      await updateDrink({ id: editingId, name: formData.name, price });
      setEditingId(null);
      setFormData({ name: '', price: '' });
      setError(null);
      loadDrinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update extra');
    }
  };

  const handleDelete = async (drinkId: string) => {
    if (!confirm('Are you sure you want to delete this extra?')) {
      return;
    }

    try {
      await deleteDrink(drinkId);
      loadDrinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete extra');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', price: '' });
    setError(null);
  };

  if (loading) {
    return <div className="loading">Loading extras...</div>;
  }

  return (
    <div className="manage-drinks-container">
      <h2>Manage Extras</h2>

      <form onSubmit={editingId ? handleUpdate : handleAdd} className="drink-form">
        <div className="form-group">
          <label htmlFor="drink-name">Extra Name:</label>
          <input
            id="drink-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Red Wine, Beer, Soft Drink, Extra Side"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="drink-price">Price (£):</label>
          <input
            id="drink-price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
        <div className="form-actions">
          {editingId ? (
            <>
              <button type="submit" className="submit-button">Update Extra</button>
              <button type="button" onClick={handleCancel} className="cancel-button">Cancel</button>
            </>
          ) : (
            <button type="submit" className="submit-button">Add Extra</button>
          )}
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="drinks-list">
        <h3>Current Extras ({drinks.length})</h3>
        {drinks.length === 0 ? (
          <p className="info-message">No extras added yet. Add your first extra above.</p>
        ) : (
          <div className="drinks-grid">
            {drinks.map((drink) => (
              <div key={drink.id} className="drink-item">
                <div className="drink-info">
                  <strong>{drink.name}</strong>
                  <span className="drink-price">£{drink.price.toFixed(2)}</span>
                </div>
                <div className="drink-actions">
                  <button onClick={() => handleEdit(drink)} className="edit-button">Edit</button>
                  <button onClick={() => handleDelete(drink.id)} className="delete-button">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

