import 'antd/dist/reset.css'; // Import Ant Design styles
import '../../CSS/AntDesignOverride.css'
import { antThemeTokens, themes } from '../../Extra components/themes';
import {
    Button,
    Card,
    ConfigProvider, Form, List, Modal,
} from 'antd';
import {PlusOutlined, RedoOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q");

const OrganisationDashboard = () => {
    const [organisationId, setOrganisationId] = useState(null);
    const userId = localStorage.getItem("user_id");
    const themeColors = themes["blauw"] || themes.blauw;
    const [caretakers, setCaretakers] = useState(undefined);
    const [caretakersList, setCaretakersList] = useState([])
    const [isCaretakerVisible, setIsCaretakerVisible] = useState(false)
    const [selectedCaretaker, setSelectedCaretaker] = useState( {
        id: 0,
        name: undefined,
        email: undefined,
        phone_number: undefined
    });

    const fetchOrganisationId = async () => {
        console.log("user Id: ", userId);
        const { data, error } = await supabase.from("Activation").select('organisation').eq("code", userId);
        setOrganisationId(data[0].organisation)
        if(error) {
            console.error(error);
        }
    }

    const fetchCaretakers = async () => {
        try {
            const{data, error} = await supabase.from('Caretaker').select('id, Activation(organisation)');
            const filteredData = data.filter(caretaker => (caretaker.Activation.organisation === organisationId));
            console.log("Fetched data", data)
            console.log("Filtered data", filteredData);
            const mappedData = filteredData.map(caretaker => (caretaker.id));
            console.log("Mapped data", mappedData)
            setCaretakers(mappedData);
        }
        catch(error) {
            console.error(error);
        }
    }

    const handleReload = () => {
        fetchOrganisationId();
        fetchCaretakers();
        fetchCaretakerInfo();
    }

    const fetchCaretakerInfo = async () => {
        let caretakersList = [];
        try {
            caretakers.map(async caretaker => {
                    const {data, error} = await supabase.from("Caretaker").select().eq("id", caretaker)
                console.log("fetch 2:", data)
                caretakersList.push(data)
                }
            )
            setCaretakersList(caretakersList);
            console.log("List", caretakersList)
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleCloseCaretaker = () => {
        setIsCaretakerVisible(false);
        setSelectedCaretaker({
            id: 0,
            email: '',
            phone_number: '',
        });
    }

    const handleClickCaretaker = (caretaker) => {
        setIsCaretakerVisible(true);
        console.log("Clicked:  ", caretaker[0])
        setSelectedCaretaker(caretaker[0]);
    }

    const styles = {
        list: {
            width: '75%',
            height: '650px'
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
            fontSize: '14px'
        },
        modal: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            position: 'relative',
            width: '80%',
            maxWidth: '500px'
        },
        deleteButton: {
            position: 'absolute',
            top: '170px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            overflow: 'hidden',
            backgroundColor: 'red'
        }}

    useEffect(() => {
        fetchOrganisationId();
        fetchCaretakers();
        fetchCaretakerInfo();
    }, []);

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
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '20px'}}>
                <div
                    style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px',}}>
                    <h1>Begeleiders: </h1>
                </div>
                <List
                    itemLayout="horizontal"
                    dataSource={caretakersList}
                    style={styles.list}
                    renderItem={(caretaker) => (
                        <List.Item>
                            <Card
                                hoverable={true}
                                onClick={() => handleClickCaretaker(caretaker)}
                            >
                                <Card.Meta
                                    title={<span style={styles.card}><li>{caretaker[0].name}</li></span>}
                                />
                                <p>{caretaker.email}</p>
                            </Card>
                        </List.Item>
                    )}
                />
                <Button onClick={handleReload}>
                    Reload
                </Button>
            </div>

            <Modal
            open={isCaretakerVisible}
            onCancel={handleCloseCaretaker}
            footer={null}
            style={{padding: '10px', height: '200px'}}
            >
                <div style={{padding: '20px'}}>
                    <Form>
                        <h1>{selectedCaretaker.name}</h1>
                        <h3>{selectedCaretaker.email}</h3>
                        <p>{selectedCaretaker.phone_number}</p>
                    </Form>
                    <Button
                        style={styles.deleteButton}>
                        Verwijder begeleider
                    </Button>
                </div>

            </Modal>

        </div>

    </ConfigProvider>
)
}


export default OrganisationDashboard;