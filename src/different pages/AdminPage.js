import 'antd/dist/reset.css'; // Import Ant Design styles
import '../CSS/AntDesignOverride.css'
import { antThemeTokens, themes } from '../themes';
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
import {PlusOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");


const AdminPage = () => {
    const [theme, setTheme] = useState('blauw');
    const themeColors = themes[theme] || themes.blauw;
    const navigate = useNavigate();
    const [Organisations, setOrganisations] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isOrganisationVisible, setIsOrganisationVisible] = useState(false);
    const [selectedOrganisation, setSelectedOrganisation] = useState({
        id: 0,
        name: undefined,
        amountUsers: 0,
        responsible: 0,
        location: undefined
    });

    useEffect(() => {fetchData()}
    , []);

    const fetchData = async () => {
        const {data, error} = await supabase.from("Organisations").select("id, name, location, maximum_activations_codes, responsible");
        const mappedData = data.map((organisation) => ({
            id: organisation.id,
            name: organisation.name,
            amountUsers: organisation.maximum_activations_codes,
            responsible: organisation.responsible,
            location: organisation.location
        }));
        if(error) {
            console.error(error);
        }
        setOrganisations(mappedData);
    }

    const fetchLocation = async (locationCode) => {
        console.log("Location code:", locationCode);
        const {data, error} = await supabase.from("Location").select("Gemeente").eq("id", locationCode);
        if(error) {
            console.error(error);
        }
        debounce(handleFieldChange("location", data[0]["Gemeente"]), 1000);
        console.log("location", data[0]["Gemeente"]);
    }

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleClickOrganisation = (organisation) => {
        setSelectedOrganisation(organisation);
        debounce(fetchLocation(organisation.location), 1000);
        setIsOrganisationVisible(true);
        console.log("Selected organisation", selectedOrganisation);
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

            if (error) {
                console.error("Error updating organisation:", error);
            } else {
                console.log("Organisation updated successfully!");
            }
            fetchData();

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
            fetchData();

        } catch (err) {
            console.error("Update failed:", err);
        }
    }

    const handleFieldChange = (field, value) => {
        setSelectedOrganisation((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCloseOrganisation = () => {
        console.log(selectedOrganisation);
        setIsOrganisationVisible(false);
        setSelectedOrganisation({
            id: undefined,
            name: undefined,
            amountUsers: 0,
            responsible: undefined,
            location: undefined,
        });
    };

    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

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
        }
    }


    return (<ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <div style={{display: 'flex', gap: '144px', flexWrap: 'wrap', justifyContent: 'center'}}>

                    <div style={{display: 'flex', gap: '144px', flexWrap: 'wrap', justifyContent: 'center'}}>
                        <h1>Organisaties: </h1>
                        <List
                            itemLayout="horizontal"
                            style={styles.list}
                            dataSource={Organisations}
                            renderItem={(organisation) => (
                                <List.Item>
                                    <Card
                                        style={styles.card}
                                        hoverable={true}
                                        onClick={() => debounce(handleClickOrganisation(organisation), 1000)}
                                    >
                                        <Card.Meta
                                            title={<span style={styles.name}><li>{organisation.name}</li></span>}
                                        />
                                        <p>{organisation.location}</p>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </div>


                    <Button
                        type="primary"
                        icon={<PlusOutlined style={{fontSize: '4rem'}}/>}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '360px',
                            height: '180px',
                        }}
                        onClick={showModal}

                    >
                        <h2 style={{margin: '0', fontSize: '24px'}}>Nieuwe organisatie toevoegen</h2>
                    </Button>
                </div>


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
                        width: '100px',
                        height: '40px',
                    }}
                    onClick={() => navigate('/login')}

                >
                    <h2 style={{margin: '0', fontSize: '1rem'}}>Afmelden</h2>
                </Button>

                <Modal
                    title="Nieuwe Organisatie"
                    name="newOrganisation"
                    visible={isModalVisible}
                    onCancel={handleModalClose}
                    footer={null}
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
                                <Input onChange={(e) => handleFieldChange("name", e.target.value)}/>
                            </Form.Item>

                            <Form.Item
                                name="hoeveelAccounts"
                                label="Hoeveel Accounts?"
                                rules={[{required: true},]}
                            >
                                <Select placeholder="Hoeveel gebruikers?" onChange={(value) => handleFieldChange("amountUsers", value)} >
                                    <Select.Option value="1">1-50</Select.Option>
                                    <Select.Option value="2">51-200</Select.Option>
                                    <Select.Option value="3">200+</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Locatie"
                                name="location"
                                rules={[{required:true, message: 'Vul een locatie in!'}]}>

                                <Input placeholder="Locatie" onChange={(e) => handleFieldChange("location", e.target.value)} />

                            </Form.Item>

                            <Form.Item
                                label="Contactpersoon"
                                name="contactPerson"
                                rules={[{required:true}]} >

                                <Input placeholder="Naam" onChange={(e) => handleFieldChange("responsible", e.target.value)} />

                            </Form.Item>

                            <Button onClick={handleNewOrganisation}>
                                Aanmaken
                            </Button>
                        </Form>
                    </div>
                </Modal>

                <Modal
                    visible={isOrganisationVisible}
                    title = {selectedOrganisation.name}
                    onCancel={handleCloseOrganisation}
                    footer={null}
                >
                    <Form
                        name="modal_form"
                    >
                        <Form.Item
                            label="Organisation"
                            name="organisation"
                            rules={[{ required: true}]}
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
                            rules={[{required: true}]}
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
                            name="contactPerson"
                            rules={[{required: true, message: 'Wijs een contactpersoon aan!'}]}>
                            <Input
                                value={selectedOrganisation.responsible}
                                onChange={(e) => handleFieldChange("responsible", e.target.value)}
                            />
                            <div/>
                        </Form.Item>

                        <Form.Item
                            label="Locatie"
                            name="location"
                            rules={[{ required: true, message: 'Duid de locatie van de organisatie aan!' }]} >
                            <Input
                                value={selectedOrganisation.location}
                                onChange={(e) => handleFieldChange("location", e.target.value)}>

                        </Input>
                            <div></div>
                        </Form.Item>


                        <Form.Item>
                            <Button type="primary" htmlType="submit" onClick={handleUpdateOrganisation}>
                                Opslaan
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

            </div>
        </ConfigProvider>
    );
};

export default AdminPage;