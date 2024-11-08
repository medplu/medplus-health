import React from 'react';
import { View, Button, Alert, ScrollView, StyleSheet, Text, Image } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const LogoUrl = 'https://res.cloudinary.com/dws2bgxg4/image/upload/e_background_removal/f_png/v1717995504/medplus-logo_iug8am.jpg';

const FREQUENCY_DESCRIPTIONS = {
    'OD': 'Once daily',
    'BD/BID': 'Twice daily',
    'TID': 'Three times daily',
    'QID': 'Four times daily',
    'QHS': 'Every night at bedtime',
};

const PrescriptionTemplate = ({ prescription }) => {
    const generatePDF = async () => {
        try {
            const htmlContent = `
                <html>
                    <head>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                            body { font-family: 'Roboto', sans-serif; padding: 30px; background-color: #f4f4f9; }
                            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                            .logo { width: 120px; height: 120px; }
                            .title { font-size: 36px; color: #333; font-weight: bold; text-align: center; }
                            .section { margin-bottom: 30px; }
                            .section-title { font-size: 22px; font-weight: 700; color: #333; margin-bottom: 10px; }
                            .section-content { font-size: 18px; color: #555; margin-bottom: 5px; }
                            .bold { font-weight: 700; }
                            .table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #ddd; }
                            .table th, .table td { padding: 12px; text-align: left; border: 1px solid #ddd; }
                            .table th { background-color: #f4f4f4; }
                            .button { background-color: #4CAF50; color: white; padding: 12px 20px; border: none; border-radius: 5px; width: 100%; font-size: 18px; }
                            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #888; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <img src="${LogoUrl}" class="logo" alt="Logo" />
                            <h1 class="title">Prescription</h1>
                        </div>
                        <div class="section">
                            <div class="section-title">Doctor Information</div>
                            <div class="section-content"><span class="bold">Doctor:</span> ${prescription?.doctorId?.firstName} ${prescription?.doctorId?.lastName}</div>
                            <div class="section-content"><span class="bold">Specialization:</span> ${prescription?.doctorId?.profession}</div>
                            <div class="section-content"><span class="bold">Date Issued:</span> ${new Date(prescription?.dateIssued || Date.now()).toLocaleDateString()}</div>
                        </div>

                        <div class="section">
                            <div class="section-title">Patient Information</div>
                            <div class="section-content"><span class="bold">Patient:</span> ${prescription?.patientId?.name}</div>
                            <div class="section-content"><span class="bold">Email:</span> ${prescription?.patientId?.email}</div>
                        </div>

                        <div class="section">
                            <div class="section-title">Medications</div>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Drug Name</th>
                                        <th>Strength</th>
                                        <th>Frequency</th>
                                        <th>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${prescription?.medication?.map(med => `
                                        <tr>
                                            <td>${med.drugName}</td>
                                            <td>${med.strength}</td>
                                            <td>${med.frequency} (${FREQUENCY_DESCRIPTIONS[med.frequency] || 'N/A'})</td>
                                            <td>${med.duration}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="section">
                            <div class="section-title">Full Prescription Data</div>
                            <pre>${JSON.stringify(prescription, null, 2)}</pre>
                        </div>

                        <div class="footer">
                            <p>Generated by MedPlus</p>
                        </div>
                    </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false,
            });

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
                <Text style={styles.sectionContent}><Text style={styles.bold}>Doctor:</Text> {prescription?.doctorId?.firstName} {prescription?.doctorId?.lastName}</Text>
                <Text style={styles.sectionContent}><Text style={styles.bold}>Specialization:</Text> {prescription?.doctorId?.profession}</Text>
                <Text style={styles.sectionContent}><Text style={styles.bold}>Date:</Text> {new Date(prescription?.dateIssued || Date.now()).toLocaleDateString()}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <Text style={styles.sectionContent}><Text style={styles.bold}>Patient:</Text> {prescription?.patientId?.name}</Text>
                <Text style={styles.sectionContent}><Text style={styles.bold}>Email:</Text> {prescription?.patientId?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Medications</Text>
                {prescription?.medication?.length ? (
                    <View style={styles.table}>
                        <View style={styles.tableRowHeader}>
                            <Text style={styles.tableHeaderCell}>Drug Name</Text>
                            <Text style={styles.tableHeaderCell}>Strength</Text>
                            <Text style={styles.tableHeaderCell}>Frequency</Text>
                            <Text style={styles.tableHeaderCell}>Duration</Text>
                        </View>
                        {prescription.medication.map((med, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{med.drugName}</Text>
                                <Text style={styles.tableCell}>{med.strength}</Text>
                                <Text style={styles.tableCell}>
                                    {med.frequency} ({FREQUENCY_DESCRIPTIONS[med.frequency] || 'N/A'})
                                </Text>
                                <Text style={styles.tableCell}>{med.duration}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.sectionContent}>No medication information available</Text>
                )}
            </View>

            <Button 
                title="Download Prescription as PDF" 
                onPress={generatePDF} 
                color="#4CAF50" 
                style={styles.downloadButton} 
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
    },
    sectionContent: {
        fontSize: 18,
        color: '#555',
        marginBottom: 5,
    },
    bold: {
        fontWeight: 'bold',
        color: '#333',
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginTop: 10,
    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: '#f4f4f4',
    },
    tableHeaderCell: {
        width: '25%',
        padding: 10,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'left',
        color: '#333',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableCell: {
        width: '25%',
        padding: 10,
        fontSize: 16,
        color: '#555',
        textAlign: 'left',
    },
    downloadButton: {
        marginTop: 20,
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 5,
    },
    footer: {
        marginTop: 30,
        textAlign: 'center',
        fontSize: 14,
        color: '#888',
    },
});

export default PrescriptionTemplate;
