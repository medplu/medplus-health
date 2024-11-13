import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, Switch } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectUser } from './store/userSlice';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons'; // For Icons
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // For flag icon

const degrees = [
  'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
  'Doctor of Medicine (MD)',
  'Doctor of Osteopathic Medicine (DO)',
  'Bachelor of Dental Surgery (BDS)',
  'Master of Dental Surgery (MDS)',
  'Bachelor of Ayurvedic Medicine and Surgery (BAMS)',
  'Bachelor of Homeopathic Medicine and Surgery (BHMS)',
  'Bachelor of Physiotherapy (BPT)',
  'Bachelor of Science in Nursing (B.Sc Nursing)',
  'Doctor of Pharmacy (Pharm.D)',
];

const universities = [
  'Harvard University',
  'Stanford University',
  'Johns Hopkins University',
  'University of Oxford',
  'University of Cambridge',
  'University of California, San Francisco',
  'Karolinska Institute',
  'University of Toronto',
  'University of Melbourne',
  'National University of Singapore',
];

const years = Array.from({ length: 50 }, (_, i) => `${new Date().getFullYear() - i}`);

const insuranceCompaniesList = [
  'AAR Insurance',
  'APA Insurance',
  'Britam',
  'CIC Insurance',
  'GA Insurance',
  'Jubilee Insurance',
  'Kenindia Assurance',
  'Madison Insurance',
  'NHIF',
  'Pacis Insurance',
  'Resolution Insurance',
  'UAP Old Mutual',
];

const AddClinicForm: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const professionalId = user.professional?._id;

  // State management
  const [step, setStep] = useState(1); // Step state
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [specialties, setSpecialties] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [languages, setLanguages] = useState('');
  const [assistantName, setAssistantName] = useState('');
  const [assistantPhone, setAssistantPhone] = useState('');
  const [insuranceCompanies, setInsuranceCompanies] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [bio, setBio] = useState('');
  const [showBioInput, setShowBioInput] = useState(false);
  const bioTextLimit = 200;

  // Education Modal state
  const [educationModalVisible, setEducationModalVisible] = useState(false);
  const [educationDetails, setEducationDetails] = useState({ country: '', degree: '', university: '', year: '', certificatePhoto: null });

  // Specialties Modal state
  const [specialtiesModalVisible, setSpecialtiesModalVisible] = useState(false);

  // Experience Modal state
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [experienceDetails, setExperienceDetails] = useState({ position: '', organization: '', startDate: '', endDate: '', currentlyWorking: false });

  const [countries, setCountries] = useState([]);
  const [bioModalVisible, setBioModalVisible] = useState(false);

  const [clinicModalVisible, setClinicModalVisible] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [selectedInsuranceCompanies, setSelectedInsuranceCompanies] = useState([]);
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        const countryNames = data.map((country) => country.name.common).sort();
        setCountries(countryNames);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  // Image Picker functionality
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      setImage(result.assets[0].uri);
    }
  };

  // Image Picker functionality for certificate
  const pickCertificateImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      setEducationDetails({ ...educationDetails, certificatePhoto: result.assets[0].uri });
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    const data = new FormData();
    const resizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    const response = await fetch(resizedImage.uri);
    const blob = await response.blob();
    data.append('file', blob);
    data.append('upload_preset', 'medplus');
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dws2bgxg4/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Upload certificate image to Cloudinary
  const uploadCertificateToCloudinary = async (imageUri) => {
    const data = new FormData();
    const resizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    const response = await fetch(resizedImage.uri);
    const blob = await response.blob();
    data.append('file', blob);
    data.append('upload_preset', 'medplus');
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dws2bgxg4/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading certificate:', error);
      throw error;
    }
  };

  // Reset form state
  const resetForm = () => {
    setName('');
    setContactInfo('');
    setAddress('');
    setCategory('');
    setImage(null);
    setSpecialties('');
    setEducation('');
    setExperience('');
    setLanguages('');
    setAssistantName('');
    setAssistantPhone('');
    setInsuranceCompanies('');
    setSelectedSpecialties([]);
    setBio('');
    setShowBioInput(false);
    setEducationDetails({ country: '', degree: '', university: '', year: '', certificatePhoto: null });
    setExperienceDetails({ position: '', organization: '', startDate: '', endDate: '', currentlyWorking: false });
    setStreet('');
    setCity('');
    setState('');
    setPostalCode('');
    setSelectedInsuranceCompanies([]);
  };

  // Submit Form
  const handleSubmit = async () => {
    try {
      console.log('Professional ID:', professionalId); // Log the professionalId
      if (!professionalId) {
        console.error('Professional ID is required');
        Alert.alert("Error", "Professional ID is required");
        return;
      }
      setUploading(true);
      let imageUrl = '';
      if (image) imageUrl = await uploadImageToCloudinary(image);

      let certificateUrl = '';
      if (educationDetails.certificatePhoto) {
        certificateUrl = await uploadCertificateToCloudinary(educationDetails.certificatePhoto);
      }

      const formData = {
        name,
        contactInfo,
        address: `${street}, ${city}, ${state}, ${postalCode}`,
        category,
        image: imageUrl,
        specialties,
        education: `${educationDetails.degree}, ${educationDetails.university} (${educationDetails.year})`,
        experiences, // Ensure experiences array is included in the form data
        languages,
        assistantName,
        assistantPhone,
        insuranceCompanies: selectedInsuranceCompanies,
        bio, // Add bio to form data
        certificate: certificateUrl, // Add certificate URL to form data
      };

      await axios.post(`https://medplus-health.onrender.com/api/clinics/register/${professionalId}`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccess(true);
      Alert.alert("Success", "Clinic created successfully!", [
        { text: "OK", onPress: () => { 
          resetForm(); // Reset form state
          navigation.navigate('professional'); 
        } }
      ]);
    } catch (error) {
      console.error('Error creating clinic:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle Education Modal submit
  const handleEducationSubmit = () => {
    setEducation(`${educationDetails.degree}, ${educationDetails.university} (${educationDetails.year})`);
    setEducationModalVisible(false);
  };

  // Handle Specialties Modal submit
  const handleSpecialtiesSubmit = () => {
    setSpecialties(selectedSpecialties.join(', '));
    setSpecialtiesModalVisible(false);
  };

  // Toggle specialty selection
  const toggleSpecialtySelection = (specialty) => {
    setSelectedSpecialties((prevSelected) => {
      if (prevSelected.includes(specialty)) {
        return prevSelected.filter((item) => item !== specialty);
      } else {
        return [...prevSelected, specialty];
      }
    });
  };

  // Handle Experience Modal submit
  const handleExperienceSubmit = () => {
    setExperiences([...experiences, experienceDetails]);
    setExperienceDetails({ position: '', organization: '', startDate: '', endDate: '', currentlyWorking: false });
    setExperienceModalVisible(false);
  };

  const handleBioSubmit = () => {
    setBioModalVisible(false);
  };

  const handleClinicSubmit = () => {
    setName(clinicName);
    setContactInfo(clinicPhone);
    setClinicModalVisible(false);
  };

  const toggleInsuranceSelection = (company) => {
    setSelectedInsuranceCompanies((prevSelected) => {
      if (prevSelected.includes(company)) {
        return prevSelected.filter((item) => item !== company);
      } else {
        return [...prevSelected, company];
      }
    });
  };

  // Remove experience
  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  // Render form content based on the current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Doctor's Information</Text>
            <View style={styles.inputRow}>
              <Ionicons name="md-medical" size={24} color="black" />
              <TouchableOpacity style={styles.inputRow} onPress={() => setSpecialtiesModalVisible(true)}>
                <Text style={styles.input}>Specialties</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="school" size={24} color="black" />
              <TouchableOpacity style={styles.inputRow} onPress={() => setEducationModalVisible(true)}>
                <Text style={styles.input}>Education</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="briefcase" size={24} color="black" />
              <TouchableOpacity style={styles.inputRow} onPress={() => setExperienceModalVisible(true)}>
                <Text style={styles.input}>Experience</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="language" size={24} color="black" />
              <TextInput style={styles.input} placeholder="Languages Spoken" value={languages} onChangeText={setLanguages} />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="document-text" size={24} color="black" />
              <TouchableOpacity style={styles.inputRow} onPress={() => setShowBioInput(!showBioInput)}>
                <Text style={styles.input}>Add a Detailed Description</Text>
              </TouchableOpacity>
            </View>
            {showBioInput && (
              <View>
                <TextInput
                  style={styles.bioInput}
                  placeholder="Enter Detailed Description"
                  value={bio}
                  onChangeText={(text) => setBio(text.slice(0, bioTextLimit))}
                  multiline
                  numberOfLines={4}
                />
                <Text style={styles.textLimit}>{bio.length}/{bioTextLimit}</Text>
              </View>
            )}
            <Button title="Next" onPress={() => setStep(2)} />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Clinic Information</Text>
            <View style={styles.inputRow}>
              <Ionicons name="information-circle" size={24} color="black" />
              <TouchableOpacity style={styles.inputRow} onPress={() => setClinicModalVisible(true)}>
                <Text style={styles.input}>Clinic Name and Contact</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressContainer}>
              <TextInput style={styles.addressInput} placeholder="Street" value={street} onChangeText={setStreet} />
              <TextInput style={styles.addressInput} placeholder="City" value={city} onChangeText={setCity} />
              <TextInput style={styles.addressInput} placeholder="State" value={state} onChangeText={setState} />
              <TextInput style={styles.addressInput} placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} />
            </View>
            <Text style={styles.sectionTitle}>Insurance Companies</Text>
            <View style={styles.insuranceContainer}>
              {insuranceCompaniesList.map((company, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.insuranceCard,
                    selectedInsuranceCompanies.includes(company) && styles.insuranceCardSelected,
                  ]}
                  onPress={() => toggleInsuranceSelection(company)}
                >
                  <Text style={styles.insuranceText}>{company}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Next" onPress={() => setStep(3)} />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Assistant Information</Text>
            <TextInput style={styles.input} placeholder="Assistant's Name" value={assistantName} onChangeText={setAssistantName} />
            <TextInput style={styles.input} placeholder="Assistant's Phone" value={assistantPhone} onChangeText={setAssistantPhone} />
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={styles.imagePickerText}>Pick Clinic Image</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <Button title="Next" onPress={() => setStep(4)} />
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Review and Submit</Text>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewTitle}>Clinic Information</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Clinic Name:</Text> {name}</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Category:</Text> {category}</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Address:</Text> {`${street}, ${city}, ${state}, ${postalCode}`}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewTitle}>Doctor's Information</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Specialties:</Text> {specialties}</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Education:</Text> {education}</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Experience:</Text> {experience}</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Languages:</Text> {languages}</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Bio:</Text> {bio}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewTitle}>Assistant Information</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Assistant Name:</Text> {assistantName}</Text>
              <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Assistant Phone:</Text> {assistantPhone}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewTitle}>Insurance Companies</Text>
              <Text style={styles.reviewItem}>{selectedInsuranceCompanies.join(', ')}</Text>
            </View>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const medicalSpecialties = [
    { name: 'Cardiology', icon: 'heart' },
    { name: 'Dermatology', icon: 'leaf' },
    { name: 'Neurology', icon: 'brain' },
    { name: 'Pediatrics', icon: 'baby' },
    { name: 'Psychiatry', icon: 'medkit' },
    // Add more specialties as needed
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderStepContent()}
      {step > 1 && <Button title="Back" onPress={() => setStep(step - 1)} />}
      
      {/* Education Modal */}
      <Modal visible={educationModalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Education Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <Picker
              selectedValue={educationDetails.country}
              onValueChange={(itemValue) => setEducationDetails({ ...educationDetails, country: itemValue })}
              style={styles.modalPicker}
            >
              <Picker.Item label="Select Country" value="" />
              {countries.map((country, index) => (
                <Picker.Item key={index} label={country} value={country} />
              ))}
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Degree</Text>
            <Picker
              selectedValue={educationDetails.degree}
              onValueChange={(itemValue) => setEducationDetails({ ...educationDetails, degree: itemValue })}
              style={styles.modalPicker}
            >
              <Picker.Item label="Select Degree" value="" />
              {degrees.map((degree, index) => (
                <Picker.Item key={index} label={degree} value={degree} />
              ))}
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>University</Text>
            <TextInput
              placeholder="Enter University"
              value={educationDetails.university}
              onChangeText={(text) => setEducationDetails({ ...educationDetails, university: text })}
              style={styles.modalInput}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year</Text>
            <Picker
              selectedValue={educationDetails.year}
              onValueChange={(itemValue) => setEducationDetails({ ...educationDetails, year: itemValue })}
              style={styles.modalPicker}
            >
              <Picker.Item label="Select Year" value="" />
              {years.map((year, index) => (
                <Picker.Item key={index} label={year} value={year} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity style={styles.imagePicker} onPress={pickCertificateImage}>
            <Text style={styles.imagePickerText}>Upload Certificate</Text>
          </TouchableOpacity>
          {educationDetails.certificatePhoto && <Image source={{ uri: educationDetails.certificatePhoto }} style={styles.image} />}
          <View style={styles.buttonGroup}>
            <Button title="Submit" onPress={handleEducationSubmit} />
            <Button title="Close" onPress={() => setEducationModalVisible(false)} />
          </View>
        </ScrollView>
      </Modal>

      {/* Specialties Modal */}
      <Modal visible={specialtiesModalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Specialties</Text>
          <View style={styles.specialtiesContainer}>
            {medicalSpecialties.map((specialty, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.specialtyCard,
                  selectedSpecialties.includes(specialty.name) && styles.specialtyCardSelected,
                ]}
                onPress={() => toggleSpecialtySelection(specialty.name)}
              >
                <Ionicons name={specialty.icon} size={24} color="black" />
                <Text style={styles.specialtyText}>{specialty.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Submit" onPress={handleSpecialtiesSubmit} />
          <Button title="Close" onPress={() => setSpecialtiesModalVisible(false)} />
        </ScrollView>
      </Modal>

      {/* Experience Modal */}
      <Modal visible={experienceModalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Experience Details</Text>
          <TextInput placeholder="Position" value={experienceDetails.position} onChangeText={(text) => setExperienceDetails({ ...experienceDetails, position: text })} style={styles.modalInput} />
          <TextInput placeholder="Organization" value={experienceDetails.organization} onChangeText={(text) => setExperienceDetails({ ...experienceDetails, organization: text })} style={styles.modalInput} />
          <TextInput placeholder="Start Date" value={experienceDetails.startDate} onChangeText={(text) => setExperienceDetails({ ...experienceDetails, startDate: text })} style={styles.modalInput} />
          <TextInput placeholder="End Date" value={experienceDetails.endDate} onChangeText={(text) => setExperienceDetails({ ...experienceDetails, endDate: text })} style={styles.modalInput} />
          <View style={styles.inputRow}>
            <Text>Currently Working Here</Text>
            <Switch value={experienceDetails.currentlyWorking} onValueChange={(value) => setExperienceDetails({ ...experienceDetails, currentlyWorking: value })} />
          </View>
          <View style={styles.buttonGroup}>
            <Button title="Submit" onPress={handleExperienceSubmit} />
            <Button title="Close" onPress={() => setExperienceModalVisible(false)} />
          </View>
        </ScrollView>
      </Modal>

      {/* Bio Modal */}
      <Modal visible={bioModalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Detailed Description</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter Detailed Description"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
          <View style={styles.buttonGroup}>
            <Button title="Submit" onPress={handleBioSubmit} />
            <Button title="Close" onPress={() => setBioModalVisible(false)} />
          </View>
        </ScrollView>
      </Modal>

      {/* Clinic Modal */}
      <Modal visible={clinicModalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Clinic Name and Contact</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Clinic Name"
            value={clinicName}
            onChangeText={setClinicName}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Clinic Phone"
            value={clinicPhone}
            onChangeText={setClinicPhone}
            keyboardType="phone-pad"
          />
          <View style={styles.buttonGroup}>
            <Button title="Submit" onPress={handleClinicSubmit} />
            <Button title="Close" onPress={() => setClinicModalVisible(false)} />
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top', // For multiline input
  },
  addressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  addressInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  insuranceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insuranceCard: {
    flexBasis: '48%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  insuranceCardSelected: {
    backgroundColor: '#d0e8ff',
    borderColor: '#007BFF',
  },
  insuranceText: {
    fontSize: 16,
  },
  imagePicker: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#fff',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  specialtyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  specialtyCardSelected: {
    backgroundColor: '#d0e8ff',
    borderColor: '#007BFF',
  },
  specialtyText: {
    marginLeft: 10,
    fontSize: 18,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  modalPicker: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  inputGroup: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
    textAlignVertical: 'top', // For multiline input
  },
  textLimit: {
    textAlign: 'right',
    color: '#888',
    marginTop: 5,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  reviewLabel: {
    fontWeight: 'bold',
  },
  experienceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  experienceText: {
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
  },
});

export default AddClinicForm;
