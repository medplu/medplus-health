import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootState } from '../store/configureStore';

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  user: string;
  profession: string;
  title: string;
  consultationFee: number;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
  attachedToClinic: boolean;
  attachedToPharmacy: boolean;
  clinic_images?: string[];
}

interface Clinic {
  _id: string;
  name: string;
  address: string;
  category: string;
  images?: string[]; 
  contactInfo: string;
  referenceCode: string;
  professionals: Professional[];
  insuranceCompanies: string[];
  specialties: string;
  experiences: string[];
  languages: string;
  assistantName: string;
  assistantPhone: string;
  bio: string;
  education: {
    course: string;
    university: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ClinicsState {
  clinicList: Clinic[];
  filteredClinicList: Clinic[];
  selectedClinic: Clinic | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClinicsState = {
  clinicList: [],
  filteredClinicList: [],
  selectedClinic: null,
  loading: false,
  error: null,
};

const fetchFreshClinics = async () => {
  try {
    const response = await axios.get('https://medplus-health.onrender.com/api/clinics');
    const clinics = response.data.map((clinic: Clinic) => ({
      ...clinic,
      images: clinic.images || [],
      professionals: clinic.professionals.map((professional: Professional) => ({
        ...professional,
        clinic_images: professional.clinic_images || [],
      })),
    }));
    await AsyncStorage.setItem('clinicList', JSON.stringify(clinics));
  } catch (error) {
    console.error('Failed to fetch fresh clinics', error);
  }
};

export const fetchClinics = createAsyncThunk(
  'clinics/fetchClinics',
  async (_, { dispatch }) => {
    const cachedClinics = await AsyncStorage.getItem('clinicList');
    if (cachedClinics) {
      const parsedClinics = JSON.parse(cachedClinics);
      fetchFreshClinics();
      return parsedClinics;
    }
    const response = await axios.get('https://medplus-health.onrender.com/api/clinics');
    const clinics = response.data.map((clinic: Clinic) => ({
      ...clinic,
      images: clinic.images || [],
      professionals: clinic.professionals.map((professional: Professional) => ({
        ...professional,
        clinic_images: professional.clinic_images || [],
      })),
    }));
    await AsyncStorage.setItem('clinicList', JSON.stringify(clinics));
    return clinics;
  }
);

export const fetchClinicById = createAsyncThunk(
  'clinics/fetchClinicById',
  async (clinicId: string, { dispatch }) => {
    const cachedClinics = await AsyncStorage.getItem('clinicList');
    const clinics = cachedClinics ? JSON.parse(cachedClinics) : [];

    let clinic = clinics.find((clinic: Clinic) => clinic._id === clinicId);
    if (!clinic) {
      const response = await axios.get(`https://medplus-health.onrender.com/api/clinics/${clinicId}`);
      clinic = response.data;
    }

    // Fetch images for the clinic
    const professionalImages = await Promise.all(
      clinic.professionals.map(async (professional: Professional) => {
        const response = await axios.get(`https://medplus-health.onrender.com/api/images/professional/${professional._id}`);
        return response.data.map((image: { urls: string[] }) => image.urls[0]);
      })
    );
    const allImages = new Set(clinic.images || []);
    professionalImages.flat().forEach(url => allImages.add(url));
    clinic.images = Array.from(allImages);

    // Update the Redux state with the fetched clinic data
    dispatch(setSelectedClinic(clinic));
    return clinic;
  }
);

export const clearClinics = createAsyncThunk(
  'clinics/clearClinics',
  async (_, { dispatch }) => {
    await AsyncStorage.removeItem('clinicList');
    dispatch(fetchClinics());
  }
);

const clinicsSlice = createSlice({
  name: 'clinics',
  initialState,
  reducers: {
    filterClinics: (state, action: PayloadAction<{ searchQuery: string }>) => {
      const { searchQuery } = action.payload;
      let filtered = state.clinicList;

      if (searchQuery) {
        filtered = filtered.filter((clinic) =>
          (clinic.name && clinic.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (clinic.address && clinic.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (clinic.category && clinic.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      state.filteredClinicList = filtered;
    },
    clearSelectedClinic: (state) => {
      state.selectedClinic = null;
    },
    resetClinics: (state) => {
      state.clinicList = [];
      state.filteredClinicList = [];
      state.selectedClinic = null;
      AsyncStorage.removeItem('clinicList');
    },
    setSelectedClinic: (state, action: PayloadAction<Clinic>) => {
      state.selectedClinic = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClinics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClinics.fulfilled, (state, action: PayloadAction<Clinic[]>) => {
        state.clinicList = action.payload;
        state.filteredClinicList = action.payload;
        state.loading = false;
      })
      .addCase(fetchClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load clinics';
      })
      .addCase(fetchClinicById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClinicById.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.selectedClinic = action.payload;
        state.loading = false;
      })
      .addCase(fetchClinicById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load clinic details';
      })
      .addCase(clearClinics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearClinics.fulfilled, (state) => {
        state.clinicList = [];
        state.filteredClinicList = [];
        state.loading = false;
      })
      .addCase(clearClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to clear clinics';
      });
  },
});

export const { filterClinics, clearSelectedClinic, resetClinics, setSelectedClinic } = clinicsSlice.actions;

export const selectClinics = (state: RootState) => state.clinics.filteredClinicList;
export const selectAllClinics = (state: RootState) => state.clinics.clinicList;
export const selectClinicDetails = (state: RootState) => state.clinics.selectedClinic;
export const selectClinicLoading = (state: RootState) => state.clinics.loading;
export const selectClinicError = (state: RootState) => state.clinics.error;

export const selectSpecialties = (state: RootState) => {
  const specialtiesSet = new Set<string>();
  state.clinics.clinicList.forEach(clinic => {
    if (clinic.specialties) {
      clinic.specialties.split(',').forEach(specialty => specialtiesSet.add(specialty.trim()));
    }
  });
  return Array.from(specialtiesSet);
};

export default clinicsSlice.reducer;
