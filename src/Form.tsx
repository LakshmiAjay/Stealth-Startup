import React, { useState, useEffect } from 'react';

interface FormField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  [key: string]: {
    fields: any[];
  };
}

const formData: any = {
  Select: {
    fields: []
  },
  userInfo: {
    fields: [
      { name: 'firstName', type: 'text', label: 'First Name', required: true },
      { name: 'lastName', type: 'text', label: 'Last Name', required: true },
      { name: 'age', type: 'number', label: 'Age', required: false },
      { name: 'aadhar', type: 'file', label: 'Upload Aadhar', required: false }
    ]
  },
  addressInfo: {
    fields: [
      { name: 'street', type: 'text', label: 'Street', required: true },
      { name: 'city', type: 'text', label: 'City', required: true },
      { name: 'state', type: 'dropdown', label: 'State', options: ['California', 'Texas', 'New York'], required: true },
      { name: 'zipCode', type: 'text', label: 'Zip Code', required: false }
    ]
  },
  paymentInfo: {
    fields: [
      { name: 'cardNumber', type: 'text', label: 'Card Number', required: true },
      { name: 'expiryDate', type: 'date', label: 'Expiry Date', required: true },
      { name: 'cvv', type: 'password', label: 'CVV', required: true },
      { name: 'cardholderName', type: 'text', label: 'Cardholder Name', required: true },
      { name: 'Reciept', type: 'file', label: 'Receipt', required: false }
    ]
  }
};

const Form: React.FC = () => {
  const [formType, setFormType] = useState<keyof FormData>('Select');
  const [formFields, setFormFields] = useState<FormField[]>(formData.Select.fields);
  const [formDataState, setFormData] = useState<any>({});
  const [submittedData, setSubmittedData] = useState<any[]>([]);
  const [selectedDataType, setSelectedDataType] = useState<string>('userInfo');
  const [errorMessages, setErrorMessages] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showFileSuccessModal,setshowFileSuccessModal]= useState(false);
  const [UploadedFileName,setUploadedFileName]=useState('')
  
  useEffect(() => {
    const fields = formData[formType].fields;
    setFormFields(fields);
    setFormData({});
    setEditIndex(null);
  }, [formType]);

  const calculateProgress = () => {
    const filledFields = formFields.filter(field => formDataState[field.name] !== undefined && formDataState[field.name] !== '');
    return Math.floor((filledFields.length / formFields.length) * 100);
  };

  const progressBarColor = () => {
    const requiredFieldsFilled = formFields.every(
      (field) => !field.required || (formDataState[field.name] !== undefined && formDataState[field.name] !== '')
    );
    return requiredFieldsFilled ? 'green' : 'red';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formDataState, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData({ ...formDataState, [name]: file.name }); 
      setUploadedFileName(file.name); 

      setshowFileSuccessModal(true)
    }
  };

  const validateForm = () => {
    const errors: any = {};
    formFields.forEach((field) => {
      if (field.required && !formDataState[field.name] && field.type !== 'file') {
        errors[field.name] = `${field.label} is required.`;
      }
    });
    setErrorMessages(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setTimeout(() => {
        const newData = { formType, data: formDataState };
        if (editIndex !== null) {
          const updatedData = [...submittedData];
          updatedData[editIndex] = newData;
          setSubmittedData(updatedData);

          setEditIndex(null);
        } else {
          setSubmittedData([...submittedData, newData]);

        }
        setShowSuccessModal(true);

        setFormData({});
        setLoading(false);
      }, 2000);
    } else {
      setShowErrorModal(true);
    }
  };

  const handleSelectSubmittedData = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFormType = e.target.value;
    setSelectedDataType(selectedFormType);
  };

  const handleEdit = (index: number) => {
    const dataToEdit = submittedData[index];
    setFormData(dataToEdit.data);
    setEditIndex(index);
  };

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedData = submittedData.filter((_, i) => i !== deleteIndex);
      setSubmittedData(updatedData);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const filteredData = submittedData.filter(data => data.formType === selectedDataType);

  return (
    <div className="form-container">
      <h2>Dynamic Form</h2>

      <select
        onChange={(e) => {
          setFormType(e.target.value as keyof FormData);
          setSelectedDataType(e.target.value);
        }}
        value={formType}
        className="form-dropdown"
      >
        <option value="Select">Select</option>
        {Object.keys(formData).map((key) => (
          key !== 'Select' && (
            <option key={key} value={key}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </option>
          )
        ))}
      </select>

      {formFields.length > 0 && (
        <>
          <div className="progress-bar-container">
            <label>Progress: {calculateProgress()}%</label>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${calculateProgress()}%`, backgroundColor: progressBarColor() }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-box">
              {formFields.map((field) => (
                <div key={field.name} className="form-field">
                  <label>
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'dropdown' ? (
                    <select
                      name={field.name}
                      onChange={handleChange}
                      value={formDataState[field.name] || ''}
                      className="input-field"
                    >
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'file' ? (
                    <div>
                      <input
                        type="file"
                        name={field.name}
                        onChange={handleFileChange}
                        className="input-field"
                      />
                      {formDataState[field.name] && (
                        <p>Selected File: {formDataState[field.name]}</p> 
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      onChange={handleChange}
                      value={formDataState[field.name] || ''}
                      className="input-field"
                    />
                  )}
                  {errorMessages[field.name] && <p className="error">{errorMessages[field.name]}</p>}
                </div>
              ))}
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <div className="spinner"></div> : 'Submit'}
              </button>
            </div>
          </form>
        </>
      )}

      {selectedDataType && filteredData.length > 0 && (
        <div className="submitted-data">
          <h3>Submitted Data for {selectedDataType}</h3>
          <table>
            <thead>
              <tr>
                {formData[selectedDataType as keyof FormData].fields.map((field: any) => (
                  <th key={field.name}>{field.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((data, index) => (
                <tr key={index}>
                  {formData[selectedDataType as keyof FormData].fields.map((field: any) => (
                    <td key={field.name}>
                      {field.type === 'file' ? (
                        data.data[field.name] ? data.data[field.name] : 'No file selected'
                      ) : (
                        data.data[field.name]
                      )}
                    </td>
                  ))}
                  <td>
                    <button onClick={() => handleEdit(index)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(index)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

{showFileSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Success!</h3>
            <p> {UploadedFileName} uploaded Successfully</p>
            <button onClick={() => setshowFileSuccessModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Success!</h3>
            <p>Data submitted successfully.</p>

            <button onClick={() => setShowSuccessModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Error</h3>
            <p>Please fill in all required fields.</p>
            <button onClick={() => setShowErrorModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this entry?</p>
            <button onClick={confirmDelete}>Yes</button>
            <button onClick={cancelDelete}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
