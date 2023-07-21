import React, { useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/es5/build/pdf';
import pdfjsWorker from 'pdfjs-dist/es5/build/pdf.worker.entry';

GlobalWorkerOptions.workerSrc = pdfjsWorker;


const WaitListForm = () => {
    const [formData, setFormData] = useState({
        openEnded: '',
        dropDown: '',
        multipleFlexible: [],
        termsAccepted: false,
        businessUse: false,
        personalUse: false,
        businessUseCaseUnique: false,
        businessUseReplace: '',
        pdfContent: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'multipleFlexible') {
            if (checked) {
                setFormData((prevData) => ({
                    ...prevData,
                    multipleFlexible: [...prevData.multipleFlexible, value]
                }));
            } else {
                setFormData((prevData) => ({
                    ...prevData,
                    multipleFlexible: prevData.multipleFlexible.filter((multipleFlexible) => multipleFlexible !== value)
                }));
            }
        } else if (type === 'checkbox') {
            setFormData((prevData) => ({
                ...prevData,
                [name]: checked
            }));
        }  else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
        console.log(formData);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.multipleFlexible.length === 0) {
            alert('Please select at least one system.');
            return;
        } else if (!formData.businessUse && !formData.personalUse) {
            alert('Please choose personal or business use.')
        }

        console.log("This is the data to be sent," + formData);

        try {
            const response = await fetch('http://localhost:5000/api/forms', {  
                method: 'POST',  
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)  
            });
            if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
            }   
            const res = await response.json();
            console.log(res);         
        } catch (error) {
            console.log(error);  
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            getDocument({data: event.target.result}).promise.then(function(pdf) {
                let pages = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    pages.push(pdf.getPage(i));
                }
                return Promise.all(pages);
            }).then(function(pages) {
                let textPromises = pages.map(page => page.getTextContent());
                return Promise.all(textPromises);
            }).then(function(textContents) {
                let allContent = textContents.map(textContent => 
                    textContent.items.map(item => item.str).join(' ')
                ).join('\n');
                setFormData((prevData) => ({
                    ...prevData,
                    pdfContent: allContent,
                }));
                console.log(allContent);
            });
        };
        reader.readAsArrayBuffer(file);
    };


    return (
        <>
            <br></br>
            <p>LET'S GET YOU STARTED!</p> 
            <p>Please fill in this short questionnaire so that InvestorHelper can serve you in the best possible way.</p>
            <p>_______________________________________________________________________________</p>
            <br></br>
        <form onSubmit={handleSubmit}>
            <div>
                <p><b>Open-ended question: </b></p>
                <label>
                    <input
                        type="text"
                        name="openEnded"
                        value={formData.openEnded}
                        onChange={handleChange}
                        required
                    />
                </label>
            </div>
            <div>
                <br></br>
                <p><b>Drop-down: </b></p>
                <label>                     
                    <select
                        name="dropDown"
                        value={formData.dropDown}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Option1">Option 1</option>
                        <option value="Option2">Option 2</option>
                        <option value="Option3">Option 3</option>
                    </select>
                </label>
            </div>

            <div>
                <br></br>
                <p><b>Multiple select with many selections allowed (adds all selected to a String array): </b></p>
                <label>
                    <input
                        type="checkbox"
                        name="multipleFlexible"
                        value="OptionA"
                        checked={formData.multipleFlexible.includes('OptionA')}
                        onChange={handleChange}
                    />{' '}
                    Option A
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="multipleFlexible"
                        value="OptionB"
                        checked={formData.multipleFlexible.includes('OptionB')}
                        onChange={handleChange}
                    />{' '}
                    Option B
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="multipleFlexible"
                        value="OptionC"
                        checked={formData.multipleFlexible.includes('OptionC')}
                        onChange={handleChange}
                    />{' '}
                    Option C
                </label>
            </div>


            <div>
                <br></br>
                <p><b>Multiple select with only one selection allowed: </b></p>
                <label>
                    <input
                        type="checkbox"
                        name="personalUse"
                        checked={formData.personalUse}
                        onChange={handleChange}
                    />{' '}
                    Option 1
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="businessUse"
                        checked={formData.businessUse}
                        onChange={handleChange}
                    />{' '}
                    Option 2
                </label>
            </div>
            {formData.businessUse ?
                <>
                    <div>
                        <p> As a business user are you looking for custom solution or to replace an existing communication tool?</p>
                        <label>
                        <input
                            type="checkbox"
                            name="businessUseCaseUnique"
                            checked={formData.businessUseCaseUnique}
                            onChange={handleChange}
                        />{' '}
                            I need a custom solution
                        </label>
                    </div>
                    {formData.businessUseCaseUnique ? null :
            <div>
                <label>
                    To replace:
                    <select
                        name="businessUseCase"
                        value={formData.businessUseCase}
                        onChange={(e) => setFormData((prevData) => ({
                            ...prevData,
                            businessUseReplace: e.target.value
                            }))
                        }
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Microsoft Teams">Microsoft Teams</option>
                        <option value="Slack">Slack</option>
                    </select>
                </label>
            </div>
                    }
                        </>: null
            }
           
            <div>
                <br></br>
                <p><b>Upload a PDF: </b></p>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                />
            </div>
            <br></br>
            <p>_______________________________________________________________________________</p>
            <div>
                <br></br>
                <p>By checking the box below your information you agree with our {' '}
                    <a
                    href="https://www.snacka.app/terms-of-use"
                >
                         Terms of Use
                </a>
                    {' '} and {' '}
                    <a
                        href="https://www.snacka.app/privacy-policy"
                    >
                        Privacy Policy                     </a>
                    .</p>
                <label>
                    <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        required
                    />{' '}
                    I accept the terms and conditions
                </label>
            </div>
            
            <br></br>
            <div>
                <button type="submit">Submit</button>
            </div>
        </form>
        </>
    );
};

export default WaitListForm;

