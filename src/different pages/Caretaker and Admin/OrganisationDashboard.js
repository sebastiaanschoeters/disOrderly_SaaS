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
    const [organisationName, setOrganizationName] = useState('')
    const userId = localStorage.getItem("user_id");
    const navigate = useNavigate();
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
        const { data, error } = await supabase.from("Activation").select('organisation').eq("code", userId);
        setOrganisationId(25);
        setOrganisationId(data[0].organisation)
        console.log('User Id: ', userId ,'Organisation Id: ', data[0].organisation);
        if(error) {
            console.error(error);
        }

    }

    const fetchOrganisationName = async () => {
        const {data, error} = await supabase.from('Organisations').select('name').eq('id', organisationId);

    }

    const fetchCaretakers = async () => {
        try {
            const{data, error} = await supabase.from('Activation')
                .select('code, organisation')
                .eq('type', 'caretaker')
                .eq('organisation', organisationId)
                .eq('usable', 'TRUE');

            const mappedData = data.map(caretaker => (caretaker.code));
            console.log("All caretakers in the organisation", mappedData)
            setCaretakers(mappedData);
        }
        catch(error) {
            console.error(error);
        }
    }

    const handleReload = async () => {
        await fetchOrganisationId();
        await fetchCaretakers();
        await fetchCaretakerInfo();
    }

    const fetchCaretakerInfo = async () => {
        try {
            const caretakerPromises =  caretakers.map(async (caretaker) => {
                    const {data, error} = await supabase.from("Caretaker").select().eq("id", caretaker);
                    if(error) {
                        console.error("Error fetching caretaker: ", error);
                        return null;
                    }
                    return data.length > 0 ? data[0] : null;
                })

            const caretakerList = await Promise.all(caretakerPromises);
            setCaretakersList(caretakerList.filter((caretaker) => caretaker !== null));
        }
        catch (error) {
            console.error(error)
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
        setTimeout(() => console.log("Clicked:  ", caretaker), 100)
        setSelectedCaretaker(caretaker);
        setIsCaretakerVisible(true);
    }

    const handleDeleteCaretaker = async (caretaker) => {
        const {error} = await supabase.from('caretaker').delete().eq("id", caretaker);

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
            top: '165px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            overflow: 'hidden',
            backgroundColor: 'red'
        }}

    useEffect(() => {
        // Step 1: Fetch the organisation ID
        const fetchOrganisationId = async () => {
            const { data, error } = await supabase
                .from("Activation")
                .select("organisation")
                .eq("code", userId);

            if (error) {
                console.error("Error fetching organisation ID:", error);
            } else if (data.length > 0) {
                setOrganisationId(data[0].organisation);
                console.log("Organisation ID fetched:", data[0].organisation);
            }
        };

        fetchOrganisationId();
    }, [userId]);

    useEffect(() => {
        // Step 2: Fetch caretakers when organisationId is updated
        if (organisationId) {
            const fetchCaretakers = async () => {
                try {
                    const { data, error } = await supabase
                        .from("Activation")
                        .select("code, organisation")
                        .eq("type", "caretaker")
                        .eq("organisation", organisationId)
                        .eq("usable", "TRUE");

                    if (error) {
                        console.error("Error fetching caretakers:", error);
                    } else {
                        const caretakerCodes = data.map((caretaker) => caretaker.code);
                        console.log("Caretaker codes fetched:", caretakerCodes);
                        setCaretakers(caretakerCodes);
                    }
                } catch (error) {
                    console.error("Unexpected error fetching caretakers:", error);
                }
            };

            fetchCaretakers();
        }
    }, [organisationId]);

    useEffect(() => {
        // Step 3: Fetch caretaker details when caretakers list is updated
        if (caretakers && caretakers.length > 0) {
            const fetchCaretakerInfo = async () => {
                try {
                    const caretakerPromises = caretakers.map(async (caretaker) => {
                        const { data, error } = await supabase
                            .from("Caretaker")
                            .select()
                            .eq("id", caretaker);

                        if (error) {
                            console.error("Error fetching caretaker info:", error);
                            return null;
                        }

                        return data.length > 0 ? data[0] : null;
                    });

                    const caretakerList = await Promise.all(caretakerPromises);
                    setCaretakersList(caretakerList.filter((caretaker) => caretaker !== null));
                    console.log("Caretaker details fetched:", caretakerList);
                } catch (error) {
                    console.error("Error fetching caretaker details:", error);
                }
            };

            fetchCaretakerInfo();
        }
    }, [caretakers]);


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
                onClick={handleReload}
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
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap:'20px',}} >
                        <h1>Begeleiders: </h1>
                    </div>
                </div>
                <List
                    itemLayout="horizontal"
                    dataSource={caretakersList}
                    style={styles.list}
                    renderItem={(caretaker) => (
                        <List.Item>
                            <Card
                                hoverable={true}
                                onClick={() => setTimeout(() => handleClickCaretaker(caretaker), 100)}
                            >
                                <Card.Meta
                                    title={<span style={styles.name}><li>{caretaker.name}</li></span>}
                                />
                                <p>{caretaker.email}</p>
                            </Card>
                        </List.Item>
                    )}
                />
            </div>
            <div>
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
                <div style={{padding: '25px'}}>
                    <Form>
                        <h2>{selectedCaretaker.name}</h2>
                        <h5>{selectedCaretaker.email}</h5>
                        <h5>{selectedCaretaker.phone_number}</h5>
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