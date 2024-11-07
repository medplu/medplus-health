import React from 'react';
import { View, Text, Button, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const PrescriptionTemplate = ({ prescription }) => {
    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'This app needs access to your storage to download the PDF',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else {
            return true;
        }
    };

    const downloadPDF = async () => {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            alert('Storage permission denied');
            return;
        }

        const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { text-align: center; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h1>Prescription</h1>
                    <p>Issued by: Dr. ${prescription.doctor.name}</p>
                    <p>Specialization: ${prescription.doctor.specialization}</p>
                    <p>Date Issued: ${new Date(prescription.dateIssued).toLocaleDateString()}</p>

                    <h2>Patient Details</h2>
                    <p>Name: ${prescription.patient.name}</p>
                    <p>Age: ${prescription.patient.age}</p>
                    <p>Gender: ${prescription.patient.gender}</p>

                    <h2>Medications</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Drug Name</th>
                                <th>Strength</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prescription.medication.map(med => `
                                <tr key=${med._id}>
                                    <td>${med.drugName}</td>
                                    <td>${med.strength}</td>
                                    <td>${med.frequency}</td>
                                    <td>${med.duration}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        const options = {
            html: htmlContent,
            fileName: `prescription_${prescription.patient.name}`,
            directory: 'Documents',
        };

        try {
            const file = await RNHTMLtoPDF.convert(options);
            alert(`PDF saved to: ${file.filePath}`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Download Prescription as PDF" onPress={downloadPDF} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        maxWidth: 600,
        margin: 'auto',
    },
});

export default PrescriptionTemplate;
