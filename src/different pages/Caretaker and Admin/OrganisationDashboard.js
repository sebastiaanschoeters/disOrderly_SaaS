import 'antd/dist/reset.css'; // Import Ant Design styles
import '../../CSS/AntDesignOverride.css'
import { antThemeTokens, themes } from '../../Extra components/themes';
import {
    Button,
    Card, Col,
    ConfigProvider, Divider, Form, List, message, Modal, Popconfirm, Popover, Progress, Row, Statistic,
} from 'antd';
import {PlusOutlined, RedoOutlined, TeamOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabaseSchema = process.env.REACT_APP_SUPABASE_SCHEMA;
const supabase = createClient(supabaseUrl, supabaseKey, {db: {schema: supabaseSchema}});

const OrganisationDashboard = () => {
    const [organisationId, setOrganisationId] = useState(null);
    const [organisationName, setOrganizationName] = useState('')
    const userId = localStorage.getItem("user_id");
    const navigate = useNavigate();
    const themeColors = themes["blauw"] || themes.blauw;
    const [caretakers, setCaretakers] = useState(undefined);
    const [caretakersList, setCaretakersList] = useState([]);
    const [isCaretakerVisible, setIsCaretakerVisible] = useState(false);
    const [isNewCaretakerVisible, setIsNewCaretakerVisible] = useState(false);
    const [generatedCode, setGeneratedCode] = useState(undefined);
    const [maximumActivationCodes, setMaximumActivationCodes] = useState(undefined);
    const [maximumAmountUsers, setMaximumAmountUsers] = useState(undefined);
    const [allActivationCodes, setAllActivationCodes] = useState([])
    const [currentUsers, setCurrentUsers] = useState(undefined);
    const [activeUsers, setActiveUsers] = useState([]);
    const [selectedCaretaker, setSelectedCaretaker] = useState( {
        id: 0,
        name: undefined,
        email: undefined,
        phone_number: undefined,
    });

    const fetchOrganisationId = async () => {
        const { data, error } = await supabase
            .from("Activation")
            .select('organisation')
            .eq("code", userId);
        if(error) {
            console.error("Error fetching organisation ID", error);
        }
        else if (data.length > 0) {
            setOrganisationId(data[0].organisation);
            console.log("Organisation ID fetched", data[0].organisation);
        }
    }

    const fetchOrganisationInfo = async () => {
        const {data, error} = await supabase
            .from('Organisations')
            .select('name, maximum_activations_codes')
            .eq('id', organisationId);
        setOrganizationName(data[0].name);
        setMaximumActivationCodes(data[0].maximum_activations_codes);
        console.log("Current plan: ", maximumActivationCodes);
        await fetchAmountUsers()
        handleMaximumAmountUsers(data[0].maximum_activations_codes);
        await fetchActiveUsers()
    }

    const fetchAmountUsers = async () => {
        const {data, error} = await supabase
            .from('Activation')
            .select('*', { count : 'exact'})
            .eq('organisation', organisationId)
            .eq('type', 'user')
            .eq('usable', 'false');
        setCurrentUsers(data.length);
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

    const fetchActivationCodes = async () => {
        const {data, error} = await supabase
            .from('Activation')
            .select('code')

        const codes = data.map(record => record.code);
        setAllActivationCodes(codes);
    }

    const handleReload = async () => {
        await fetchOrganisationId();
        await fetchCaretakers();
        await fetchCaretakerInfo();
        await fetchOrganisationInfo();
        await fetchAmountUsers();
    }

    const handleMaximumAmountUsers = (maximumActivationCodes) => {
        if(maximumActivationCodes === 1) {
            setMaximumAmountUsers(50);
        }
        if(maximumActivationCodes === 2) {
            setMaximumAmountUsers(200);
        }
        if(maximumActivationCodes === 3) {
            setMaximumAmountUsers(1000);
        }
        console.log('Maximum amount users: ', maximumAmountUsers)
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

    const fetchActiveUsers = async () => {
        const {data, error} = await supabase
            .from("Chatroom")
            .select('sender_id, receiver_id')

        const userIds = data.reduce((acc, row) => {
            acc.push(row.sender_id, row.receiver_id);
            return acc;
        }, []);

        const uniqueUserIds = [...new Set(userIds)];

        setActiveUsers(uniqueUserIds);
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

    const handleOpenNewCaretaker = () => {
        setIsNewCaretakerVisible(true);
    }

    const handleGenerateCode = async () => {
        await fetchActivationCodes;
        let newCode = getRandomInt(1000, 9999)
        while (allActivationCodes.includes(newCode)) {
            newCode = getRandomInt(1000, 9999);
        }

        const {error} = await supabase.from("Activation").insert({"code": newCode,"usable": true, "type": "caretaker", "organisation": organisationId}).select();
        console.log(newCode);
        if(error) {
            console.error(error);
        }
        else {
            await setGeneratedCode(newCode);
        }
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max-min) + min);
    }

    const handleCloseNewCaretaker = async () => {
        setIsNewCaretakerVisible(false);
    }

    const handleUpgradePlan = async () => {
        console.log(maximumActivationCodes)
        if(maximumActivationCodes < 3) {
            let newPlan = maximumActivationCodes + 1
            const {error} = await supabase
                .from('Organisations')
                .update({maximum_activations_codes: newPlan})
                .eq("id", organisationId);
            await fetchOrganisationInfo();
        }
        else {
            message.error({content:"Het aantal gebruikers kan niet meer verhoogd worden.", style:{fontSize:'20px'}})
        }

    }

    const styles = {
        list: {
            width: '60%',
            height: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
        },
        card: {
            width: '100%',
            height: '80px',
            marginBottom: '20px',
            borderRadius: '15px',
            borderWidth: '1px',
            borderColor: themeColors.primary7,
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
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
        },
        button: {
            width: '90%',
            maxWidth: '400px',
            height: 'auto'
        },}

    useEffect(() => {
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
        if (organisationId) {
            fetchOrganisationInfo();
        }
    }, [organisationId]);

    useEffect(() => {
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

    const confirm = async () => {
        await handleUpgradePlan();
    }

    const cancel = () => {

    }


    return (<ConfigProvider theme={{token: antThemeTokens(themeColors)}}>
        <div
            style={{
                padding: '10px',
                position: 'relative',
                width: '100%',
                minHeight: '100vh',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'begin',
                gap: '20px',
            }}>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}>
                <Button
                    type="primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '120px',
                        height: '100px',
                    }}
                    icon={<RedoOutlined/>}
                    onClick={handleReload}
                >

                    <h6> Herladen </h6>
                </Button>
                <Button
                    type="primary"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '120px',
                        height: '100px',
                    }}
                    onClick={() => navigate('/login')}

                >
                    <h2 style={{margin: '0', fontSize: '1rem'}}>Afmelden</h2>
                </Button>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '100%',
                alignItems: 'center',
            }}>
                <h1 style={{fontSize: '40px'}}>{organisationName}</h1>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    width: '100%',
                    gap: '60px',
                    height: '100%'
                }}>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        gap: '30px',
                        top: '10px'
                    }}>
                        <Popover content='Een gebruiker wordt beschouwd als actief vanaf de gebruiker deelneemt aan een chat.' color='lightgray' placement='bottom'>
                            <Card style={{
                                backgroundColor: 'lightgray',
                                height: '100%'
                            }}>
                                <Card.Meta title='Actieve gebruikers'/>
                                <div style={{display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '30px'}}>
                                    <TeamOutlined style={{fontSize: '30px'}}/>
                                    <Statistic value={activeUsers.length}/>
                                </div>
                            </Card>
                        </Popover>

                        <Card style={{backgroundColor:'lightgray', height: '100%'}}>
                            <Card.Meta title='Geregistreerde gebruikers'/>
                            <div style={{
                            }}>
                                <TeamOutlined style={{fontSize: '30px'}}/>
                                <Row gutter={30}>
                                    <Col span={25}>
                                        <Statistic prefix={currentUsers} value='/ ' suffix={maximumAmountUsers}/>
                                    </Col>
                                </Row>
                            </div>
                            <Progress percent={currentUsers*100/maximumAmountUsers} showInfo={false} />
                        </Card>

                        <Popconfirm
                            title="Upgrade plan"
                            description="Weet je zeker dat je je plan wilt upgraden, het maandelijks te betalen bedraag zal automatisch verhoogd worden."
                            onConfirm={confirm}
                            onCancel={cancel}
                            color="lightgray"
                            placement="bottom"
                            okText="Ja"
                            okType="default"
                            okButtonProps={{style: {
                                backgroundColor: 'green',
                                    fontSize: '15px',
                                    fontweight: 'bold',
                            }, size: 'large'
                        }}
                            cancelButtonProps={{style: {
                                backgroundColor: 'red',
                                    fontSize: '15px',
                                    fontweight: 'bold',
                                }, size: 'large'}}
                            cancelText="Nee"
                            style={{height:'100%'}}
                        >
                            <Card style={{backgroundColor: 'lightgray',
                                height: '100%', minHeight:'156px'}}
                                  hoverable={true}>
                                <h3>Upgrade plan</h3>
                                +€35 /maand
                            </Card>
                        </Popconfirm>


                    </div>

                    <Divider/>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        gap: '20px',

                    }}>
                        <h1 style={{fontSize:'20px'}}>Begeleiders: </h1>
                        <List
                            itemLayout="horizontal"
                            dataSource={caretakersList}
                            style={styles.list}
                            locale={{emptyText:"De organisatie heeft nog geen begeleiders, genereer hieronder een code."}}
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
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            style={styles.button}
                            onClick={handleOpenNewCaretaker}
                        >
                            <h6> Nieuwe begeleider toevoegen </h6>
                        </Button>
                    </div>
                </div>
            </div>
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
                        style={styles.deleteButton}
                        onClick={() => handleDeleteCaretaker(selectedCaretaker.id)}>
                        Verwijder begeleider
                    </Button>
                </div>
            </Modal>

            <Modal
                open={isNewCaretakerVisible}
                onCancel={handleCloseNewCaretaker}
                footer={null}
                style={{padding: '10px', display:'flex', flexDirection:'column'}}
            >
                <h3>Code voor de nieuwe begeleider:</h3>
                <h2>{generatedCode}</h2>
                <div/>
                <text style={{fontSize:'14px'}}>Genereer hier een activatiecode waarmee een account voor begeleider aangemaakt kan worden.</text>
                <div/>
                <Button
                    type={"primary"}
                    onClick={handleGenerateCode}
                >
                    Genereer
                </Button>
            </Modal>
        </ConfigProvider>
    )
}


export default OrganisationDashboard;