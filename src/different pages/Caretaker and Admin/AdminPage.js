import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css'
import { antThemeTokens, themes } from '../../Extra components/themes';
import {Button, Card, ConfigProvider, Form, Input, List, Modal, Select, AutoComplete, message} from 'antd';
import {PlusOutlined, RedoOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import logo from '../../Media/clarity.jpg'
import { createClient } from "@supabase/supabase-js";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import '../../CSS/AdminPage.css'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const [allLocations, setAllLocations] = useState([]);
    const [generatedOrganisation, setGeneratedOrganisation] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [oldResponsible, setOldResponsible] = useState('')
    const [allActivationCodes, setAllActivationCodes] = useState([])
    const [selectedOrganisation, setSelectedOrganisation] = useState({
        id: 0,
        name: undefined,
        amountUsers: 0,
        responsible: 0,
        responsibleName: '',
        location: 0,
        locationName: ''
    });
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {fetchData()}
    , []);

    const fetchData = async () => {
        const {data, error} = await supabase.from("Organisations").select("id, name, maximum_activations_codes, responsible, location:Location ( id, Gemeente, Postcode )").order("name");
        const mappedData = data.map((organisation) => ({
            id: organisation.id,
            name: organisation.name,
            amountUsers: organisation.maximum_activations_codes,
            responsible: organisation.responsible,
            location: organisation.location?.id || null,
            locationName: organisation.location?.Gemeente|| "",
        }));
        if(error) {
            console.error(error);
        }
        setOrganisations(mappedData);
        fetchNames();
        fetchLocations();
    }

    const fetchLocations = async () => {
        const {data, error} = await supabase
            .from('Location')
            .select('id, Gemeente, Postcode')
        if (error){
            console.error(error)
        }
        const mappedLocations = data.map((gemeente) => ({
            label: gemeente.Gemeente + ' (' + gemeente.Postcode + ')',
            value: gemeente.id
        }))
        setAllLocations(mappedLocations);
    }

    const fetchLocationName = (locationCode) => {
        const foundLocation = allLocations.find((location) => location.value === locationCode);
        return foundLocation.label
    }

    const fetchNames = async () => {
        const {data, error} = await supabase.from("Caretaker").select("id, name").order("name");
        if (error){
            console.error(error)
        }

        const mappedData = data.map((user) => ({
            value: user.id,
            label: user.name,
        }))
        setNames(mappedData);
    }

    const fetchResponsibleName = (responsible) => {
        const name = names.find((person) => person.value === responsible);
        return name.label;
    }

    const fetchActivationCodes = async () => {
        const {data, error} = await supabase
            .from('Activation')
            .select('code')
        if (error){
            console.error(error)
        }

        const codes = data.map(record => record.code);
        setAllActivationCodes(codes);
    }

    const handleCloseCaretaker = () => {
        setCaretakerVisible(false);
        setGeneratedCode("");
    }

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedOrganisation(prev => ({ ...prev,
            id: 0,
            name: '',
            amountUsers: 0,
            reponsible: 0,
            location: 0
        }));
    };

    const handleClickOrganisation = async (organisation) => {
        try {
            const {data, error} = await supabase
                .from("Location")
                .select("id")
                .eq("Gemeente", organisation.locationName);

            if (error){
                console.error(error)
            }

            setOldResponsible(organisation.responsible);
            const locationCode = data.length > 0 ? data[0].id : 0;
            const locationName = fetchLocationName(locationCode);
            const responsibleName = fetchResponsibleName(organisation.responsible);
            setSelectedOrganisation({
                ...organisation,
                location: locationCode,
                locationName: locationName,
                responsibleName: responsibleName
            });
        } catch (error) {
            console.error("Error fetching organisation details:", error);
        }
            setIsOrganisationVisible(true);

    }

    const handleUpdateOrganisation = async () => {
        try {
            const {error } = await supabase
                .from("Organisations")
                .update({
                    name: selectedOrganisation.name,
                    maximum_activations_codes: selectedOrganisation.amountUsers,
                    responsible: selectedOrganisation.responsible,
                    location: selectedOrganisation.location,
                })
                .eq("id", selectedOrganisation.id);

            handleNewResponsible(selectedOrganisation.responsible)
            if (error) {
                console.error("Error updating organisation:", error);
            } else {
                console.log("Organisation updated successfully!");
                handleMessage('De informatie is bijgewerkt!')
            }
            fetchData();

        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleNewOrganisation = async () => {
        try {
            console.log("Inserted organisation", selectedOrganisation)
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
        setSelectedOrganisation((prev) => ({
            ...prev,
            [field]: value,
        }))
    };

    const handleNewLocation = async (value, label) => {
        await handleFieldChange("location", value);
        await handleFieldChange('locationName', label);
    }

    const handleCloseOrganisation = () => {
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
            handleMessage('De organisatie is verwijderd')
            console.log("Organisation deleted successfully!");
        }
        fetchData();
    };

    const handleGenerateCode = async () => {
        await fetchActivationCodes();
        let random = getRandomInt(1000, 9999);
        while(allActivationCodes.includes(random)) {
            random = getRandomInt(1000, 9999)
        }

        const {error} = await supabase.from("Activation").insert({"code": random ,"usable": true, "type": "caretaker", "organisation": generatedOrganisation});
        if(error) {
            handleMessage('Code kan niet gegenereerd worden.')
        }
        else {
            await setGeneratedCode(random);
        }
    }

    const handleGeneratedOrganisation = (organisation) => {
        setGeneratedOrganisation(organisation);
    }

    const handleNewResponsible = async (newResponsible) => {
        setOldResponsible(selectedOrganisation.responsible)
        setSelectedOrganisation(prev => ({
            ...prev,
            responsible: newResponsible,
        }));

        try {
            const {error} = await supabase
                .from("Organisations")
                .update({
                    responsible: newResponsible,
                })
                .eq("id", selectedOrganisation.id);

            if (error) {
                console.error("Error updating organisation:", error);
            } else {
                console.log("Organisation updated successfully!");
            }
        }
        catch (err) {
                console.error("Update failed:", err);
            }

        try {
            const {error} = await supabase
                .from('Credentials')
                .update({type: 'caretaker'})
                .eq('user_id', oldResponsible);
            if (error) {
                console.error("Error updating credentials table:", error);
            } else {
                console.log("Credentials updated successfully!");
            }
        }
        catch (error) {
            console.error("Update failed:", error);
        }

        try {
            const {error} = await supabase
                .from('Credentials')
                .update({type: 'responsible'})
                .eq('user_id', newResponsible);
            if (error) {
                console.error("Error updating credentials table:", error);
            } else {
                console.log("Credentials updated successfully!");
            }
        }

        catch (error) {
            console.error("Update failed:", error);
        }

        try {
            const {error} = await supabase
                .from('Activation')
                .update({type: 'responsible'})
                .eq('code', newResponsible);
            if (error) {
                console.error("Error updating activation table:", error);
            } else {
                console.log("Activation updated successfully!");
            }
        }

        catch (error) {
            console.error("Update failed:", error);
        }

        try {
            const {error} = await supabase
                .from('Activation')
                .update({type: 'caretaker'})
                .eq('code', oldResponsible);
            if (error) {
                console.error("Error updating activation table:", error);
            } else {
                console.log("Activation updated successfully!");
            }
        }

        catch (error) {
            console.error("Update failed:", error);
        }
    }

    const showCaretaker = () => {
        setCaretakerVisible(true);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleMessage = (content) => {
        messageApi.open({content: content})
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max-min) + min);
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
                    minHeight: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'begin',
                    gap: '20px',
                    flexWrap: 'wrap'
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
                style={{width: '25%', margin:' 20px auto', height:'25%', backgroundColor:'white', maxWidth: '150px', maxHeight:'85px'}}
                onClick={() => window.open('https://clarity.microsoft.com/projects/view/p658v8svx1/dashboard?date=Last%207%20days', '_blank')}>
                    <img src={logo} width='100%' height='100%' alt="logo" style={{top:'40px'}}/>
                </Button>
                <Button
                    type="primary"
                    style={{
                        position: 'absolute',
                        bottom: '20px',
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
                    onClick={() => window.open('https://clarity.microsoft.com/projects/view/p658v8svx1/dashboard?date=Last%203%20days', '_blank')}

                >
                    <h2 style={{margin: '0', fontSize: '1rem'}}>Clarity</h2>
                </Button>
                <div style={{display: 'flex', flexDirection:'column', gap: '20px', width: '100%', alignItems: 'center', paddingTop:'100px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '20px'}}>
                        <div
                        style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap:'20px',}}>
                            <h1 style={{fontSize:'35px'}}> Admin </h1>
                            <h3>Organisaties: </h3>
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
                    <Button
                        type="primary"
                        className="chat-support-button"
                        style={styles.button}
                        onClick={() => { navigate('/chatoverview')}}
                    >
                        <h6> ChatSupport </h6>
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

                            <AutoComplete
                                fieldNames={{ value: 'label', key:'value'}}
                                value={selectedOrganisation.locationName}
                                placeholder="Locatie"
                                options={allLocations}
                                onSelect={(value, option) => {
                                    handleNewLocation(option.value, value);
                                }}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().startsWith(input.toLowerCase())}
                            />

                        </Form.Item>

                        <Form.Item
                            label="Contactpersoon"
                            name="contactPerson"
                            rules={[{required: true}]}>

                            <AutoComplete
                                fieldNames={{ value: 'label', key:'value'}}
                                placeholder="Kies een contactpersoon"
                                options={names}
                                onSelect={(value, option) => {
                                    handleFieldChange("responsible", option.value);
                                }}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().startsWith(input.toLowerCase())}
                            />

                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={styles.saveButton} onClick={handleNewOrganisation}>
                                Aanmaken
                            </Button>
                        </Form.Item>
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

                        <AutoComplete
                            value={selectedOrganisation.responsibleName}
                            fieldNames={{ value: 'label', key:'value'}}
                            placeholder="Kies een contactpersoon"
                            options={names}
                            onSelect={(value, option) => {
                                handleFieldChange("responsible", option.value);
                            }}
                            onChange={(value) => handleFieldChange("responsibleName", value)}
                            filterOption={(input, option) =>
                                option.label.toLowerCase().startsWith(input.toLowerCase())}
                        />
                        <div/>
                    </Form.Item>

                    <Form.Item
                        label="Locatie"
                        name="location">
                        <AutoComplete
                            value={selectedOrganisation.locationName}
                            fieldNames={{ value: 'label', key:'value'}}
                            placeholder="Kies een locatie"
                            options={allLocations}
                            onSelect={(value, option) => {
                                handleFieldChange("location", option.value);
                            }}
                            onChange={(value) => handleFieldChange("locationName", value)}
                            filterOption={(input, option) =>
                                option.label.toLowerCase().startsWith(input.toLowerCase())}
                        />
                        <div/>
                    </Form.Item>


                    <Form.Item>
                        <div style={{display:'flex', flexDirection:'column'}}>
                                <Button type="primary" htmlType="submit" onClick={() => {
                                    handleUpdateOrganisation();
                                    handleCloseOrganisation();
                                }} style={styles.saveButton}>
                                    Opslaan
                                </Button>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <div>
                            <Button type="primary" htmlType="submit"
                                    onClick={() => {
                                        handleDeleteOrganisation();
                                        handleCloseOrganisation();
                                    }}
                                    style={styles.deleteButton}>
                                Verwijder organisatie
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isCaretakerVisible}
                onCancel={handleCloseCaretaker}
                footer={null}
                style={{padding: '10px'}}
            >
                <Select
                    style={{ width: "95%" }}
                    placeholder="Kies een organisatie"
                    onChange={handleGeneratedOrganisation}
                    value={generatedOrganisation}
                    allowClear
                >
                    {Organisations.map((organisation) => (
                        <Select.Option key={organisation.name} value={organisation.id}>
                            {organisation.name}
                        </Select.Option>
                    ))}
                </Select>
                <h3>Code voor de nieuwe begeleider:</h3>
                <h2>{generatedCode}</h2>

                <Button
                    type={"primary"}
                    onClick={handleGenerateCode}
                >
                    Genereer
                </Button>
            </Modal>
        </ConfigProvider>
    );
};

export default AdminPage;