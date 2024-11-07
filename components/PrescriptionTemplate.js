import React from 'react';
import { View, Button, Alert, ScrollView, StyleSheet, Text, Image } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Cloudinary logo URL
const LogoUrl = 'https://res.cloudinary.com/dws2bgxg4/image/upload/e_background_removal/f_png/v1717995504/medplus-logo_iug8am.jpg'; // Replace with your Cloudinary URL

// Add frequency descriptions mapping
const FREQUENCY_DESCRIPTIONS = {
    'OD': 'Once ',
    'BD/BID': '2 Times a Day',
    'TID': '3 Times a Day',
    'QID': '4 Times a Day',
    'QHS': 'Every Night at Bedtime',
};

const PrescriptionTemplate = ({ prescription }) => {
    const generatePDF = async () => {
        try {
            // Prepare HTML content for PDF with improved styling and logo
            const htmlContent = `
                <html>
                    <head>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                            body { font-family: 'Roboto', sans-serif; padding: 20px; }
                            .header { display: flex; align-items: center; }
                            .logo { width: 100px; height: 100px; }
                            h1 { text-align: center; color: #333; }
                            .doctor-info, .patient-info { margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f4f4f4; }
                            .section-title { font-size: 18px; margin-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <img src="${LogoUrl}" class="logo" alt="Logo" />
                            <h1>Prescription</h1>
                        </div>

                        <div class="doctor-info">
                            <strong>Doctor:</strong> ${prescription?.doctorId?.firstName || 'N/A'} ${prescription?.doctorId?.lastName || 'N/A'}<br/>
                            <strong>Specialization:</strong> ${prescription?.doctorId?.profession || 'N/A'}<br/>
                            <strong>Date:</strong> ${new Date(prescription?.dateIssued || Date.now()).toLocaleDateString()}
                        </div>

                        <div class="patient-info">
                            <strong>Patient:</strong> ${prescription?.patientId?.name || 'N/A'}<br/>
                            <strong>Email:</strong> ${prescription?.patientId?.email || 'N/A'}<br/>
                        </div>

                        <div class="section-title">Medications</div>
                        <table>
                            <tr>
                                <th>Drug Name</th>
                                <th>Strength</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                            </tr>
                            ${prescription?.medication?.map(med => `
                                <tr>
                                    <td>${med.drugName}</td>
                                    <td>${med.strength}</td>
                                    <td>${med.frequency} (${FREQUENCY_DESCRIPTIONS[med.frequency] || 'N/A'})</td>
                                    <td>${med.duration}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </body>
                </html>
            `;

            // Generate the PDF file
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false,
            });

            // Share the PDF
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert('Error', 'Failed to generate the PDF.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: LogoUrl }} style={styles.logo} />
                <Text style={styles.title}>Prescription</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Doctor Information</Text>
                <Text style={styles.infoText}>Doctor: {prescription?.doctorId?.firstName || 'N/A'} {prescription?.doctorId?.lastName || 'N/A'}</Text>
                <Text style={styles.infoText}>Specialization: {prescription?.doctorId?.profession || 'N/A'}</Text>
                <Text style={styles.infoText}>Date: {new Date(prescription?.dateIssued || Date.now()).toLocaleDateString()}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <Text style={styles.infoText}>Patient: {prescription?.patientId?.name || 'N/A'}</Text>
                <Text style={styles.infoText}>Email: {prescription?.patientId?.email || 'N/A'}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Medications</Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.tableHeaderCell]}>Drug Name</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderCell]}>Strength</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderCell]}>Frequency</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderCell]}>Duration</Text>
                </View>
                {prescription?.medication?.map((med, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{med.drugName}</Text>
                        <Text style={styles.tableCell}>{med.strength}</Text>
                        {/* Modify Frequency Display to Include Description */}
                        <Text style={styles.tableCell}>
                            {med.frequency} ({FREQUENCY_DESCRIPTIONS[med.frequency] || 'N/A'})
                        </Text>
                        <Text style={styles.tableCell}>{med.duration}</Text>
                    </View>
                ))}
            </View>
            <Button title="Download Prescription as PDF" onPress={generatePDF} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginRight: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
        color: '#555',
    },
    infoText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#666',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 5,
        marginBottom: 5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
    },
    tableCell: {
        flex: 1,
        fontSize: 14, // Reduced font size from 16 to 14
        color: '#444',
        flexWrap: 'nowrap', // Prevent text from wrapping
    },
    tableHeaderCell: {
        fontWeight: '700',
        color: '#333',
        fontSize: 14, // Reduced font size from default if necessary
    },
});

export default PrescriptionTemplate;
