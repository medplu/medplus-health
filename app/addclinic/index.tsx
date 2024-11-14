import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, Switch, Platform } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateAttachedToClinic } from '../store/userSlice';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Card, Title, Paragraph, Button as PaperButton, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';

const degrees = [
  'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
  'Doctor of Medicine (MD)',
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
  const router = useRouter(); 
  const user = useSelector(selectUser);
  const professionalId = user.professional?._id;
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [languages, setLanguages] = useState('');
  const [assistantName, setAssistantName] = useState('');
  const [assistantPhone, setAssistantPhone] = useState('');
  const [insuranceCompanies, setInsuranceCompanies] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [showBioInput, setShowBioInput] = useState(false);
  const bioTextLimit = 200;

  const [educationModalVisible, setEducationModalVisible] = useState(false);
  const [educationDetails, setEducationDetails] = useState<{
    country: string;
    degree: string;
    university: string;
    year: string;
    certificatePhoto: string | null;
  }>({
    country: '',
    degree: '',
    university: '',
    year: '',
    certificatePhoto: null,
  });

  const [specialtiesModalVisible, setSpecialtiesModalVisible] = useState(false);

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
  const [experiences, setExperiences] = useState<{ position: string; organization: string; startDate: string; endDate: string; currentlyWorking: boolean; }[]>([]);

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    } else {
      console.error('Image selection was canceled or no assets found.');
    }
  };

  const uploadImage = async (imageUri: string): Promise<string> => {
    const data = new FormData();
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);
    data.append('upload_preset', 'medplus');

    const response = await fetch('https://api.cloudinary.com/v1_1/dws2bgxg4/image/upload', {
      method: 'POST',
      body: data,
    });

    const result = await response.json();
    return result.secure_url;
  };

  const resetForm = () => {
    setName('');
    setContactInfo('');
    setAddress('');
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

  const handleSubmit = async () => {
    try {
      console.log('Professional ID:', professionalId);
      if (!professionalId) {
        console.error('Professional ID is required');
        Alert.alert("Error", "Professional ID is required");
        return;
      }
      setUploading(true);
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const formData = {
        name,
        contactInfo,
        address: `${street}, ${city}, ${state}, ${postalCode}`,
        image: imageUrl,
        specialties, 
        education: `${educationDetails.degree, educationDetails.university} (${educationDetails.year})`,
        experiences,
        languages,
        assistantName,
        assistantPhone,
        insuranceCompanies: selectedInsuranceCompanies,
        bio,
      };

      await axios.post(`https://medplus-health.onrender.com/api/clinics/register/${professionalId}`, formData, {
  };
  
  const uploadImageToCloudinary = (imageUri: string, p0: string, p1: string): Promise<string> => {
    return uploadImageToCloudinary(imageUri, 'medplus', 'image.jpg');
  };
  
  const uploadCertificateToCloudinary = (imageUri: string): Promise<string> => {
    return uploadImageToCloudinary(imageUri, 'medplus', 'certificate.jpg');
  };
  

  const resetForm = () => {
    setName('');
    setContactInfo('');
    setAddress('');
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

  const handleSubmit = async () => {
    try {
      console.log('Professional ID:', professionalId);
      if (!professionalId) {
        console.error('Professional ID is required');
        Alert.alert("Error", "Professional ID is required");
        return;
      }
      setUploading(true);
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImageToCloudinary(image, 'medplus', 'image.jpg');
      }

      let certificateUrl = '';
      if (educationDetails.certificatePhoto) {
        certificateUrl = await uploadCertificateToCloudinary(educationDetails.certificatePhoto);
      }

      const formData = {
        name,
        contactInfo,
        address: `${street}, ${city}, ${state}, ${postalCode}`,
        image: imageUrl,
        specialties, 
        education: `${educationDetails.degree, educationDetails.university} (${educationDetails.year})`,
        experiences,
        languages,
        assistantName,
        assistantPhone,
        insuranceCompanies: selectedInsuranceCompanies,
        bio,
        certificate: certificateUrl,
      };

      await axios.post(`https://medplus-health.onrender.com/api/clinics/register/${professionalId}`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccess(true);
      dispatch(updateAttachedToClinic(true));

      if (Platform.OS === 'web') {
        window.alert("Success: Clinic created successfully!");
        resetForm();
        router.push('/professional/tabs');
      } else {
        Alert.alert("Success", "Clinic created successfully!", [
          { 
            text: "OK", 
            onPress: () => { 
              resetForm(); 
              router.push('/professional/tabs');
            } 
          }
        ]);
      }
      
    } catch (error) {
      console.error('Error creating clinic:', error);
      Alert.alert("Submission Error", "An error occurred while creating the clinic. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEducationSubmit = () => {
    setEducation(`${educationDetails.degree, educationDetails.university} (${educationDetails.year})`);
    setEducationModalVisible(false);
  };

  const handleSpecialtiesSubmit = () => {
    setSpecialties(selectedSpecialties.join(', '));
    setSpecialtiesModalVisible(false);
  };

  const toggleSpecialtySelection = (specialty: string) => {
    setSelectedSpecialties((prevSelected) => {
      if (prevSelected.includes(specialty)) {
        return prevSelected.filter((item) => item !== specialty);
      } else {
        return [...prevSelected, specialty];
      }
    });
  };

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

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContentContainer}>
            <Text style={styles.stepTitle}>Doctor's Information</Text>
            
            <TouchableOpacity style={styles.card} onPress={() => setSpecialtiesModalVisible(true)}>
              <View style={styles.cardContent}>
                <Ionicons name="medkit" size={24} color="black" />
                <Text style={styles.cardText}>Specialties</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => setEducationModalVisible(true)}>
              <View style={styles.cardContent}>
                <Ionicons name="school" size={24} color="black" />
                <Text style={styles.cardText}>Education</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => setExperienceModalVisible(true)}>
              <View style={styles.cardContent}>
                <Ionicons name="briefcase" size={24} color="black" />
                <Text style={styles.cardText}>Experience</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="globe" size={24} color="black" />
                <Picker
                  selectedValue={languages}
                  onValueChange={(itemValue) => setLanguages(itemValue)}
                  style={styles.cardInput}
                >
                  <Picker.Item label="Select Language" value="" />
                  <Picker.Item label="English" value="English" />
                  <Picker.Item label="Swahili" value="Swahili" />
                  <Picker.Item label="French" value="French" />
                  <Picker.Item label="Arabic" value="Arabic" />
                </Picker>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => setShowBioInput(!showBioInput)}>
              <View style={styles.cardContent}>
                <Ionicons name="document-text" size={24} color="black" />
                <Text style={styles.cardText}>Add a Detailed Description</Text>
              </View>
              {showBioInput && (
                <View style={styles.bioContainer}>
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
            </TouchableOpacity>

            <Button title="Next" onPress={() => setStep(2)} />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContentContainer}>
            <Text style={styles.stepTitle}>Clinic Information</Text>
            
            <TouchableOpacity style={styles.card} onPress={() => setClinicModalVisible(true)}>
              <View style={styles.cardContent}>
                <Ionicons name="information-circle" size={24} color="black" />
                <Text style={styles.cardText}>Clinic Name and Contact</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => setSpecialtiesModalVisible(true)}>
              <View style={styles.cardContent}>
                <Ionicons name="briefcase" size={24} color="black" />
                <Text style={styles.cardText}>Specialty</Text>
              </View>
              <TextInput
                style={styles.cardInput}
                placeholder="Specialty"
                value={specialties}
                onChangeText={setSpecialties}
                editable={false}
              />
            </TouchableOpacity>

            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="location-sharp" size={24} color="black" />
                <Text style={styles.cardText}>Address</Text>
              </View>
              <View style={styles.addressContainer}>
                <TextInput style={styles.addressInput} placeholder="Street" value={street} onChangeText={setStreet} />
                <TextInput style={styles.addressInput} placeholder="City" value={city} onChangeText={setCity} />
                <TextInput style={styles.addressInput} placeholder="State" value={state} onChangeText={setState} />
                <TextInput style={styles.addressInput} placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} />
              </View>
            </View>

            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="shield-checkmark" size={24} color="black" />
                <Text style={styles.cardText}>Insurance Companies</Text>
              </View>
              <View style={styles.insuranceContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {insuranceCompaniesList.map((company) => (
                    <TouchableOpacity
                      key={company}
                      style={[
                        styles.insuranceCard,
                        selectedInsuranceCompanies.includes(company) && styles.insuranceCardSelected,
                      ]}
                      onPress={() => toggleInsuranceSelection(company)}
                    >
                      <Text style={styles.insuranceText}>{company}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>

            <Button title="Next" onPress={() => setStep(3)} />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContentContainer}>
            <Text style={styles.stepTitle}>Assistant Information</Text>
            
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="person" size={24} color="black" />
                <Text style={styles.cardText}>Assistant's Name</Text>
              </View>
              <TextInput
                style={styles.cardInput}
                placeholder="Assistant's Name"
                value={assistantName}
                onChangeText={setAssistantName}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="call" size={24} color="black" />
                <Text style={styles.cardText}>Assistant's Phone</Text>
              </View>
              <TextInput
                style={styles.cardInput}
                placeholder="Assistant's Phone"
                value={assistantPhone}
                onChangeText={setAssistantPhone}
                keyboardType="phone-pad"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={pickImage}>
              <View style={styles.cardContent}>
                <Ionicons name="image" size={24} color="black" />
                <Text style={styles.cardText}>Clinic Image</Text>
              </View>
              <Text style={styles.imagePickerText}>Pick Clinic Image</Text>
              {image && <Image source={{ uri: image }} style={styles.image} />}
            </TouchableOpacity>

            <Button title="Next" onPress={() => setStep(4)} />
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContentContainer}>
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="information-circle" size={24} color="black" />
                <Text style={styles.cardText}>Clinic Information</Text>
              </View>
              <Paragraph>
                <Text style={styles.reviewLabel}>Clinic Name:</Text> {name}
              </Paragraph>
              <Paragraph>
                <Text style={styles.reviewLabel}>Address:</Text> {`${street}, ${city}, ${state}, ${postalCode}`}
              </Paragraph>
            </Card>

            <Card style={styles.card}>
              <Paragraph>
                <Text style={styles.reviewLabel}>Address:</Text> {`${street}, ${city}, ${state}, ${postalCode}`}
              </Paragraph>
            </Card>

            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="medkit" size={24} color="black" />
                <Text style={styles.cardText}>Doctor's Information</Text>
              </View>
              <Paragraph>
                <Text style={styles.reviewLabel}>Specialties:</Text> {specialties}
              </Paragraph>
              <Paragraph>
                <Text style={styles.reviewLabel}>Education:</Text> {education}
              </Paragraph>
              <Paragraph>
                <Text style={styles.reviewLabel}>Experience:</Text> {experiences.map(exp => `${exp.position} at ${exp.organization}`).join('; ')}
              </Paragraph>
              <Paragraph>
                <Text style={styles.reviewLabel}>Languages:</Text> {languages}
              </Paragraph>
              <Paragraph>
                <Text style={styles.reviewLabel}>Bio:</Text> {bio}
              </Paragraph>
            </Card>

            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="person" size={24} color="black" />
                <Text style={styles.cardText}>Assistant Information</Text>
              </View>
              <Paragraph>
                <Text style={styles.reviewLabel}>Assistant Name:</Text> {assistantName}
              </Paragraph>
              <Paragraph>
                <Text style={styles.reviewLabel}>Assistant Phone:</Text> {assistantPhone}
              </Paragraph>
            </Card>

            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <Ionicons name="shield-checkmark" size={24} color="black" />
                <Text style={styles.cardText}>Insurance Companies</Text>
              </View>
              <Paragraph>{selectedInsuranceCompanies.join(', ')}</Paragraph>
            </Card>

            {image && <Card.Cover source={{ uri: image }} style={styles.imageCard} />}

            <PaperButton
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={uploading}
            >
              {uploading ? <ActivityIndicator color="#fff" /> : 'Submit'}
            </PaperButton>
          </View>
        );
      default:
        return null;
    }
  };

  const medicalSpecialties = [
    { name: 'Cardiology' },
    { name: 'Dermatology' },
    { name: 'Neurology' },
    { name: 'Pediatrics' },
    { name: 'Psychiatry' },
  ];

  const renderStepIndicator = () => {
    const indicators = [];
    const totalSteps = 4;
    for (let i = 1; i <= totalSteps; i++) {
      indicators.push(
        <View key={i} style={styles.stepContainer}>
          <View style={[styles.stepIndicator, i <= step && styles.activeStep]}>
            <Text style={[styles.stepText, i <= step && styles.activeStepText]}>{i}</Text>
          </View>
          {i < totalSteps && <View style={[styles.line, i < step && styles.activeLine]} />}
        </View>
      );
    }
    return <View style={styles.indicatorContainer}>{indicators}</View>;
  };

  return (
    <View style={{ flex: 1, paddingTop: 20 }}>
      {renderStepIndicator()}
      <ScrollView contentContainerStyle={styles.container}>
        {renderStepContent()}
        {step > 1 && <Button title="Back" onPress={() => setStep(step - 1)} />}
        
        <Modal visible={educationModalVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title>Enter Education Details</Title>
                <Divider style={styles.divider} />
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
                  <PaperButton mode="contained" onPress={handleEducationSubmit} style={styles.paperButton}>
                    Submit
                  </PaperButton>
                  <PaperButton mode="text" onPress={() => setEducationModalVisible(false)} style={styles.paperButton}>
                    Close
                  </PaperButton>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </Modal>

        <Modal visible={specialtiesModalVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title>Select Specialties</Title>
                <Divider style={styles.divider} />
                <View style={styles.specialtiesContainer}>
                  {medicalSpecialties.map((specialty, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.specialtyCard,
                        selectedSpecialties.includes(specialty.name) && styles.specialtyCardSelected,
                        { backgroundColor: backgroundColors[index % backgroundColors.length] },
                      ]}
                      onPress={() => toggleSpecialtySelection(specialty.name)}
                    >
                      <Text style={styles.specialtyText}>{specialty.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.buttonGroup}>
                  <PaperButton mode="contained" onPress={handleSpecialtiesSubmit} style={styles.paperButton}>
                    Submit
                  </PaperButton>
                  <PaperButton mode="text" onPress={() => setSpecialtiesModalVisible(false)} style={styles.paperButton}>
                    Close
                  </PaperButton>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </Modal>

        <Modal visible={experienceModalVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title>Enter Experience Details</Title>
                <Divider style={styles.divider} />
                <TextInput placeholder="Position" value={experienceDetails.position} onChangeText={(text) => setExperienceDetails({ ...experienceDetails, position: text })} style={styles.modalInput} />
                <TextInput placeholder="Organization" value={experienceDetails.organization} onChangeText={(text) => setExperienceDetails({ ...experienceDetails, organization: text })} style={styles.modalInput} />
                <TextInput placeholder="Start Date" value={experienceDetails.startDate} onChangeText={(text) => setExperienceDetails({ ...experienceDetails, startDate: text })} style={styles.modalInput} />
                <TextInput placeholder="End Date" value={experienceDetails.endDate} onChangeText={(text) => setExperienceDetails({ ...experienceDetails, endDate: text })} style={styles.modalInput} />
                <View style={styles.inputRow}>
                  <Text>Currently Working Here</Text>
                  <Switch value={experienceDetails.currentlyWorking} onValueChange={(value) => setExperienceDetails({ ...experienceDetails, currentlyWorking: value })} />
                </View>
                <View style={styles.buttonGroup}>
                  <PaperButton mode="contained" onPress={handleExperienceSubmit} style={styles.paperButton}>
                    Submit
                  </PaperButton>
                  <PaperButton mode="text" onPress={() => setExperienceModalVisible(false)} style={styles.paperButton}>
                    Close
                  </PaperButton>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </Modal>

        <Modal visible={bioModalVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title>Enter Detailed Description</Title>
                <Divider style={styles.divider} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter Detailed Description"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.buttonGroup}>
                  <PaperButton mode="contained" onPress={handleBioSubmit} style={styles.paperButton}>
                    Submit
                  </PaperButton>
                  <PaperButton mode="text" onPress={() => setBioModalVisible(false)} style={styles.paperButton}>
                    Close
                  </PaperButton>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </Modal>

        <Modal visible={clinicModalVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title>Enter Clinic Name and Contact</Title>
                <Divider style={styles.divider} />
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
                  <PaperButton mode="contained" onPress={handleClinicSubmit} style={styles.paperButton}>
                    Submit
                  </PaperButton>
                  <PaperButton mode="text" onPress={() => setClinicModalVisible(false)} style={styles.paperButton}>
                    Close
                  </PaperButton>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </Modal>
      </ScrollView>
    </View>
  );
};

const backgroundColors = [
  '#F0F8FF',
  '#FAFAD2',
  '#FFE4E1',
  '#F5F5DC',
  '#E6E6FA',
];

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1, // Changed from flex: 1 to flexGrow: 1
  },
  stepContentContainer: {
    flexDirection: 'column',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subSection: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlignVertical: 'top',
  },
  addressContainer: {
    flexDirection: 'column', // Changed from 'row' to 'column' for vertical layout
    // ...existing styles...
  },
  addressInput: {
    width: '100%', // Ensures inputs take full width in block layout
    marginRight: 0, // Removed right margin for vertical stacking
    marginBottom: 10, // Added spacing between fields
    // ...existing styles...
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  insuranceContainer: {
    flexDirection: 'row',
    // ...existing styles...
  },
  insuranceCard: {
    // ...existing styles...
    marginRight: 10, // Add spacing between cards
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
    width: '100%',
    height: 200,
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
    alignItems: 'stretch',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    padding: 20,
    marginTop: 20,
  },
  divider: {
    marginVertical: 10,
  },
  paperButton: {
    marginTop: 10,
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
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  specialtyCardSelected: {
    borderColor: '#007BFF',
  },
  specialtyText: {
    fontSize: 18,
    textAlign: 'center',
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
    textAlignVertical: 'top',
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
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 35,
    height: 35,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E7E7E7',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    borderColor: 'pink',
    backgroundColor: 'pink',
  },
  stepText: {
    color: '#E7E7E7',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeStepText: {
    color: 'white',
  },
  line: {
    width: 20,
    height: 2,
    backgroundColor: '#E7E7E7',
    marginHorizontal: 10,
  },
  activeLine: {
    backgroundColor: 'pink',
  },
  stepContentContainer: {
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    marginLeft: 10,
  },
  cardInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    fontSize: 16,
    marginLeft: 10,
  },
  bioContainer: {
    marginTop: 10,
    },
    bioInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
      textAlignVertical: 'top',
    },
  }); 


export default AddClinicForm;
