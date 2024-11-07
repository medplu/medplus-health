import React from 'react';
import html2pdf from 'html2pdf.js';

const PrescriptionTemplate = ({ prescription }) => {
    // Handler for downloading the prescription as a PDF
    const downloadPDF = () => {
        const element = document.getElementById("prescription-content");
        html2pdf()
            .from(element)
            .set({
                margin: 1,
                filename: `prescription_${prescription.patient.name}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            })
            .save();
    };

    return (
        <div>
            <div id="prescription-content" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
                <h1 style={{ textAlign: 'center' }}>Prescription</h1>
                <p>Issued by: Dr. {prescription.doctor.name}</p>
                <p>Specialization: {prescription.doctor.specialization}</p>
                <p>Date Issued: {new Date(prescription.dateIssued).toLocaleDateString()}</p>

                <h2>Patient Details</h2>
                <p>Name: {prescription.patient.name}</p>
                <p>Age: {prescription.patient.age}</p>
                <p>Gender: {prescription.patient.gender}</p>

                <h2>Medications</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Drug Name</th>
                            <th>Strength</th>
                            <th>Frequency</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescription.medication.map((med) => (
                            <tr key={med._id}>
                                <td>{med.drugName}</td>
                                <td>{med.strength}</td>
                                <td>{med.frequency}</td>
                                <td>{med.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={downloadPDF} style={{ display: 'block', margin: '20px auto' }}>
                Download Prescription as PDF
            </button>
        </div>
    );
};

export default PrescriptionTemplate;
