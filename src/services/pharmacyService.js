import api, { isMockMode } from './api';
import { initialMedicines, initialDispensingHistory } from '../mocks/medicines';

let medicinesDb = [...initialMedicines];
let dispensingDb = [...initialDispensingHistory];

export const pharmacyService = {
  getMedicines: async (params = {}) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      let results = [...medicinesDb];
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.generic_name.toLowerCase().includes(q) ||
            m.batch_number.toLowerCase().includes(q)
        );
      }
      if (params.category && params.category !== 'All') {
        results = results.filter((m) => m.category === params.category);
      }
      if (params.status && params.status !== 'All') {
        results = results.filter((m) => m.status === params.status);
      }
      return {
        success: true,
        message: 'Medicines retrieved successfully',
        data: results,
      };
    }
    return api.get('/medicines', { params });
  },

  getLowStockMedicines: async () => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      const results = medicinesDb.filter((m) => m.stock <= m.reorder_level);
      return {
        success: true,
        message: 'Low stock medicines retrieved',
        data: results,
      };
    }
    return api.get('/medicines/low-stock');
  },

  addMedicine: async (medData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 250));
      const newId = `MED-${Math.floor(5000 + Math.random() * 5000)}`;
      const status = Number(medData.stock) <= Number(medData.reorder_level || 50) ? 'Low Stock' : 'In Stock';
      const newMedicine = {
        id: newId,
        status,
        ...medData,
      };
      medicinesDb.unshift(newMedicine);
      return {
        success: true,
        message: 'Medicine added successfully to inventory',
        data: newMedicine,
      };
    }
    return api.post('/medicines', medData);
  },

  updateMedicine: async (id, medData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      const idx = medicinesDb.findIndex((m) => m.id === id);
      if (idx === -1) throw { success: false, message: 'Medicine not found', data: null };
      medicinesDb[idx] = { ...medicinesDb[idx], ...medData };
      return {
        success: true,
        message: 'Medicine details updated',
        data: medicinesDb[idx],
      };
    }
    return api.put(`/medicines/${id}`, medData);
  },

  updateStock: async (id, addedQuantity) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 200));
      const idx = medicinesDb.findIndex((m) => m.id === id);
      if (idx !== -1) {
        medicinesDb[idx].stock += Number(addedQuantity);
        medicinesDb[idx].status = medicinesDb[idx].stock <= medicinesDb[idx].reorder_level ? 'Low Stock' : 'In Stock';
        return {
          success: true,
          message: 'Medicine stock updated successfully',
          data: medicinesDb[idx],
        };
      }
    }
    return api.patch(`/medicines/${id}/stock`, { quantity: addedQuantity });
  },

  dispenseMedicine: async (dispenseData) => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 300));
      const newRecord = {
        id: `DISP-${Math.floor(8000 + Math.random() * 2000)}`,
        dispensed_at: new Date().toLocaleString(),
        ...dispenseData,
      };
      dispensingDb.unshift(newRecord);

      // Decrement stock in mock
      const matchedMed = medicinesDb.find((m) => m.name.includes(dispenseData.medicine));
      if (matchedMed) {
        matchedMed.stock = Math.max(0, matchedMed.stock - Number(dispenseData.dispensed_qty || 1));
        if (matchedMed.stock <= matchedMed.reorder_level) {
          matchedMed.status = 'Low Stock';
        }
      }

      return {
        success: true,
        message: 'Medicine dispensed and inventory updated',
        data: newRecord,
      };
    }
    return api.post('/pharmacy/dispense', dispenseData);
  },

  getDispensingHistory: async () => {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 150));
      return {
        success: true,
        message: 'Dispensing history retrieved',
        data: dispensingDb,
      };
    }
    return api.get('/pharmacy/dispensing-history');
  },
};

