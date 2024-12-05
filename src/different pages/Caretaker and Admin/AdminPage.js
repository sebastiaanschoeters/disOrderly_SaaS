import 'antd/dist/reset.css'; // Import Ant Design styles
import '../../CSS/AntDesignOverride.css'
import { antThemeTokens, themes } from '../../Extra components/themes';
import {
    Button,
    Card,
    ConfigProvider,
    Form,
    Input,
    List,
    Modal,
    Select
} from 'antd';
import {PlusOutlined, RedoOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");


const AdminPage = () => {
    const theme = 'blauw'
    const themeColors = themes[theme] || themes.blauw;

    useThemeOnCSS(themeColors);

    const navigate = useNavigate();
    const [Organisations, setOrganisations] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCaretakerVisible, setCaretakerVisible] = useState(false);
    const [isOrganisationVisible, setIsOrganisationVisible] = useState(false);
    const [names, setNames] = useState([]);
    const [generatedOrganisation, setGeneratedOrganisation] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [selectedOrganisation, setSelectedOrganisation] = useState({
        id: 0,
        name: undefined,
        amountUsers: 0,
        responsible: 0,
        location: undefined,
        locationName: undefined
    });

    useEffect(() => {fetchData()}
    , []);

    const fetchData = async () => {
        const {data, error} = await supabase.from("Organisations").select("id, name, maximum_activations_codes, responsible, location:Location ( id, Gemeente )").order("name");
        const mappedData = data.map((organisation) => ({
            id: organisation.id,
            name: organisation.name,
            amountUsers: organisation.maximum_activations_codes,
            responsible: organisation.responsible,
            location: organisation.location?.id || null,
            locationName: organisation.location?.Gemeente || "",
        }));
        if(error) {
            console.error(error);
        }
        setOrganisations(mappedData);

        fetchNames();
    }

    const fetchLocationCode = async (locationName) => {
        try {
            const { data, error } = await supabase
                .from("Location")
                .select("id")
                .eq("Gemeente", locationName);

            if (error) {
                console.error("Error fetching location code:", error);
                return null;
            }

            if (data.length === 0) {
                console.warn("No location found for the given name.");
                return null;
            }

            return data[0].id; // Return the first matching location ID
        } catch (err) {
            console.error("Error:", err);
            return null;
        }
    };

    const fetchNames = async () => {
        const {data, error} = await supabase.from("Caretaker").select("id, name, Activation(type)");
        const mappedData = data.map((user) => ({
            id: user.id,
            name: user.name,
            role: user.Activation.type,
        }))

        console.log(mappedData[0]);

        setNames(mappedData);
    }

    const showCaretaker = () => {
        setCaretakerVisible(true);
    }

    const handleCloseCaretaker = () => {
        setCaretakerVisible(false);
        setGeneratedCode("");
    }

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleClickOrganisation = async (organisation) => {
        try {
            console.log(organisation);
            const {data, error} = await supabase
                .from("Location")
                .select("id")
                .eq("Gemeente", organisation.locationName);

            if (error) {
                console.error(error);
                return;
            }

            const locationCode = data.length > 0 ? data[0].id : 0;

            setSelectedOrganisation({
                ...organisation,
                location: locationCode, // Use the resolved location name
            });

            setIsOrganisationVisible(true);
        } catch (error) {
            console.error("Error fetching organisation details:", error);
        }
    }

    const handleUpdateOrganisation = async () => {
        try {
            console.log(selectedOrganisation);
            const {error } = await supabase
                .from("Organisations")
                .update({
                    name: selectedOrganisation.name,
                    maximum_activations_codes: selectedOrganisation.amountUsers,
                    responsible: selectedOrganisation.responsible,
                    location: selectedOrganisation.location,
                })
                .eq("id", selectedOrganisation.id);

            if (error) {
                console.error("Error updating organisation:", error);
            } else {
                console.log("Organisation updated successfully!");
            }
            fetchData();
            handleCloseOrganisation();

        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleNewOrganisation = async () => {
        try {
            console.log(selectedOrganisation);
            const {error } = await supabase
                .from("Organisations")
                .insert({
                    name: selectedOrganisation.name,
                    maximum_activations_codes: selectedOrganisation.amountUsers,
                    responsible: selectedOrganisation.responsible,
                    location: selectedOrganisation.location,
                });

            if (error) {
                console.error("Error updating organisation:", error);
            } else {
                console.log("Organisation updated successfully!");
            }
            await fetchData();
            handleCloseOrganisation();

        } catch (err) {
            console.error("Update failed:", err);
        }
    }

    const handleFieldChange = async (field, value) => {
        if (field === "location") {
            // Convert location name to code
            const locationCode = await fetchLocationCode(value);
            if (!locationCode) {
                console.error("Invalid location provided.");
                setSelectedOrganisation((prev) => ({
                    ...prev,
                    [field]: value,
                }));
            }

            else {
                setSelectedOrganisation((prev) => ({
                    ...prev,
                    [field]: locationCode, // Save the code instead of the name
                }));
            }
        }
        else {
            setSelectedOrganisation((prev) => ({
                ...prev,
                [field]: value,
            }))
        }
    };

    const handleCloseOrganisation = () => {
        console.log(selectedOrganisation);
        setIsOrganisationVisible(false);
        setSelectedOrganisation({
            id: 0,
            name: undefined,
            amountUsers: 0,
            responsible: 0,
            location: 0,
            locationName: undefined
        });
    };

    const handleDeleteOrganisation = async () => {
        const {error} = await supabase.from("Organisations").delete().eq("id", selectedOrganisation.id);
        if (error) {
            console.error("Error deleting organisation:", error);
        } else {
            console.log("Organisation deleted successfully!");
        }
        fetchData();
    };

    const handleGenerateCode = async () => {
        console.log("Organization picked: ",generatedOrganisation)
        const {data, error} = await supabase.from("Activation").insert({"usable": true, "type": "caretaker", "organisation": generatedOrganisation}).select();
        await setGeneratedCode(data[0].code);
        console.log("Generated code: ", data[0]["code"]);
    }

    const handleGeneratedOrganisation = (organisation) => {
        setGeneratedOrganisation(organisation);
    }

    const styles = {
        list: {
            width: '75%',
        },
        card: {
            width: '100%',
            height: '75px',
            marginBottom: '10px',
            borderRadius: '10px',
            borderWidth: '1px',
            borderColor: themeColors.primary7,
            cursor: 'pointer',
        },
        name: {
            fontSize: '14px',
        },
        modal: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            position: 'relative',
            width: '80%',
            maxWidth: '500px'
        },
        closeButton: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
        },
        button: {
            width: '90%',
            maxWidth: '400px',
            height: 'auto',
        },
        saveButton: {
            position: 'absolute',
            left: '1px',
            bottom: '2px'
        },
        deleteButton: {
            position: 'absolute',
            right: '1px',
            bottom: '2px',
            backgroundColor: 'red'
        }
    }

    return (<ConfigProvider theme={{token: antThemeTokens(themeColors)}}>

            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'begin',
                    gap: '20px',
                }}>
                <Button
                    type="primary"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '120px',
                        height: '100px',
                    }}
                    icon={<RedoOutlined/>}
                    onClick={fetchData}
                >
                    <h6> Reload data </h6>
                </Button>
                <Button
                    type="primary"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '120px',
                        height: '100px',
                    }}
                    onClick={() => navigate('/login')}

                >
                    <h2 style={{margin: '0', fontSize: '1rem'}}>Afmelden</h2>
                </Button>
                <div style={{display: 'flex', flexDirection:'column', gap: '20px', width: '100%', alignItems: 'center', paddingTop:'100px'}}>

                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '20px'}}>
                        <div
                        style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap:'20px',}}>
                            <h1>Organisaties: </h1>
                        </div>
                        <List
                            itemLayout="horizontal"
                            style={styles.list}
                            dataSource={Organisations}
                            renderItem={(organisation) => (
                                <List.Item>
                                    <Card
                                        style={styles.card}
                                        hoverable={true}
                                        onClick={() => handleClickOrganisation(organisation)}
                                    >
                                        <Card.Meta
                                            title={<span style={styles.name}><li>{organisation.name}</li></span>}
                                        />
                                        <p>{organisation.locationName}</p>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        width: '100%',
                    }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            style={styles.button}
                            onClick={showModal}
                        >
                            <h6> Nieuwe organisatie toevoegen </h6>
                        </Button>

                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            style={styles.button}
                            onClick={showCaretaker}
                        >
                            <h6> Genereer code voor een begeleider </h6>
                        </Button>
                    </div>


                </div>

                <Modal
                    title="Nieuwe Organisatie"
                    name="newOrganisation"
                    open={isModalVisible}
                    onCancel={handleModalClose}
                    footer={null}
                    style={{padding: '10px'}}
                >
                    <div>
                        <Form
                            name="New Organisation Form"
                            initialValues={{remember: true}}
                            onFinish={handleNewOrganisation}
                            onFinishFailed={(errorInfo) =>
                                console.log('Failed:', errorInfo)
                            }
                        >
                            <Form.Item
                                label="De naam van de organisatie"
                                name="organisationName"
                                rules={[
                                    {
                                        required: true, message: 'Geef de naam van de nieuwe organisatie'
                                    },]}>
                                <Input onChange={async (e) => await handleFieldChange("name", e.target.value)}
                                       value={selectedOrganisation.name}
                                />
                            </Form.Item>

                            <Form.Item
                                name="hoeveelAccounts"
                                label="Hoeveel Accounts?"
                                rules={[{required: true},]}
                            >
                                <Select placeholder="Hoeveel gebruikers?"
                                        value={selectedOrganisation.amountUsers}
                                        onChange={(value) => handleFieldChange("amountUsers", value)}>
                                    <Select.Option value="1">1-50</Select.Option>
                                    <Select.Option value="2">51-200</Select.Option>
                                    <Select.Option value="3">200+</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Locatie"
                                name="location"
                                rules={[{required: true, message: 'Vul een locatie in!'}]}>

                                <Input placeholder="Locatie"
                                       onChange={(e) => handleFieldChange("location", e.target.value)}/>

                            </Form.Item>

                            <Form.Item
                                label="Contactpersoon"
                                name="contactPerson"
                                rules={[{required: true}]}>

                                <Input placeholder="Naam"
                                       onChange={(e) => handleFieldChange("responsible", e.target.value)}/>

                            </Form.Item>

                            <Button onClick={handleNewOrganisation}>
                                Aanmaken
                            </Button>
                        </Form>
                    </div>
                </Modal>

                <Modal
                    open={isOrganisationVisible}
                    title={selectedOrganisation.name}
                    onCancel={handleCloseOrganisation}
                    footer={null}
                    style={{padding: '10px'}}
                >
                    <Form
                        name="modal_form"
                        initialValues={{
                            organisation: selectedOrganisation.name,
                            aantalGebruikers: selectedOrganisation.amountUsers,
                            contactPerson: selectedOrganisation.responsible,
                            location: selectedOrganisation.location,
                        }}
                        onValuesChange={(changedValues) => {
                            const [key, value] = Object.entries(changedValues)[0];
                            handleFieldChange(key, value);
                        }}
                        onFinish={handleUpdateOrganisation}
                    >
                        <Form.Item
                            label="Organisation"
                            name="organisation"
                            value={selectedOrganisation.name}
                        >
                            <Input
                                value={selectedOrganisation.name}
                                onChange={(e) => handleFieldChange("name", e.target.value)}
                            />
                            <div></div>
                        </Form.Item>

                        <Form.Item
                            label="Aantal gebruikers"
                            name="aantalGebruikers"
                        >
                            <Select
                                value={selectedOrganisation.amountUsers}
                                onChange={(value) => handleFieldChange("amountUsers", value)}
                            >
                                <Select.Option value={1}>1-50</Select.Option>
                                <Select.Option value={2}>51-200</Select.Option>
                                <Select.Option value={3}>200+</Select.Option>
                            </Select>
                            <div/>
                        </Form.Item>

                        <Form.Item
                            label="Contactpersoon"
                            name="contactPerson">
                            <Input
                                value={selectedOrganisation.responsible}
                                onChange={(e) => handleFieldChange("responsible", e.target.value)}
                            />
                            <div/>
                        </Form.Item>

                        <Form.Item
                            label="Locatie"
                            name="location">
                            <Input
                                value={selectedOrganisation.locationName}
                                onChange={async (e) => {
                                    const locationName = e.target.value;
                                    setSelectedOrganisation((prev) => ({
                                        ...prev,
                                        locationName, // Update the name for display immediately
                                    }));

                                    // Fetch the location code asynchronously
                                    const locationCode = await fetchLocationCode(locationName);

                                    if (locationCode !== null) {
                                        setSelectedOrganisation((prev) => ({
                                            ...prev,
                                            location: locationCode, // Save the location ID
                                        }));
                                    }
                                }}/>

                            <div/>
                        </Form.Item>


                        <Form.Item>
                            <Button type="primary" htmlType="submit" onClick={handleUpdateOrganisation} style={styles.saveButton}>
                                Opslaan
                            </Button>

                            <Button type="primary" htmlType="submit" onClick={handleDeleteOrganisation} style={styles.deleteButton}>
                                Verwijder organisatie
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    open={isCaretakerVisible}
                    onCancel={handleCloseCaretaker}
                    footer={null}
                    style={{padding: '10px'}}
                >
                    <div>
                        <Select
                            style={{ width: "95%" }}
                            placeholder="Kies een organisatie"
                            onChange={handleGeneratedOrganisation}
                            value={generatedOrganisation}
                            allowClear
                        >
                            {Organisations.map((organisation) => (
                                <Select.Option key={organisation.name} value={organisation.name}>
                                    {organisation.name}
                                </Select.Option>
                            ))}
                        </Select>
                        <h3>Code voor de nieuwe begeleider:</h3>
                        <h2>{generatedCode}</h2>
                    </div>
                    <div>
                        <Button
                            type={"primary"}
                            onClick={handleGenerateCode}
                        >
                            Genereer
                        </Button>
                    </div>

                </Modal>

            </div>
        </ConfigProvider>
    );
};

export default AdminPage;