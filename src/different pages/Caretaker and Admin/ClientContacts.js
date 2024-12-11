import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {Avatar, Button, Modal, Table, Input} from "antd";
import {UserOutlined} from "@ant-design/icons";
import ProfileCard from "./CaretakerProfilePage";
import {useNavigate} from "react-router-dom";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const useContacts = (userID) => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const fetchChatrooms = async () => {
            const { data, error } = await supabase
                .from('Chatroom')
                .select('id, sender_id, receiver_id, acceptance, senderProfile: sender_id(id, name, profile_picture, caretaker), receiverProfile: receiver_id(id, name, profile_picture, caretaker)')
                .or(`sender_id.eq.${userID},receiver_id.eq.${userID}`);

            if (error) {
                console.error('Error fetching chatrooms:', error);
            } else {
                const formattedContacts = data.map((chat) => {
                    const profile =
                        chat.sender_id === userID ? chat.receiverProfile : chat.senderProfile;

                    const isSender = chat.sender_id === userID;

                    return {
                        ...chat,
                        profileId: profile.id,
                        profileName: profile.name,
                        profilePicture: profile.profile_picture,
                        caretaker: profile.caretaker,
                        isSender: isSender
                    };
                });
                setContacts(formattedContacts);
            }
        };

        fetchChatrooms();
    }, [userID]);

    return { contacts };
};

const ContactsOverview = ({ id: userID , conversations: conversations}) => {
    if (conversations == null){
        conversations = false
    }

    const navigate = useNavigate();

    const { contacts } = useContacts(userID);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(5);
    const [selectedCaretakerId, setSelectedCaretakerId] = useState(null);
    const [clientName, setClientName] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        setFilteredContacts(
            contacts.filter(contact =>
                contact.profileName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [contacts, searchQuery]);

    useEffect(() => {
        const calculatePageSize = () => {
            const screenHeight = window.innerHeight;
            const rowHeight = 130; // Approximate row height
            const headerHeight = 300; // Approximate header and padding
            const footerHeight = 30; // Approximate footer height
            const availableHeight = screenHeight - headerHeight - footerHeight;

            return Math.max(1, Math.floor(availableHeight / rowHeight));
        };

        setPageSize(calculatePageSize());

        const handleResize = () => {
            setPageSize(calculatePageSize());
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    function handleCaretakerClick(caretaker, clientName) {
        setSelectedCaretakerId(caretaker);
        setClientName(clientName);
        setIsModalVisible(true);
    }

    const columns = [
        {
            dataIndex: "profilePicture",
            key: "profilePicture",
            render: (profilePicture, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        src={profilePicture}
                        alt="Profile Picture"
                        size={64}
                        style={{ marginRight: 10 }}
                    />
                    <p style={{ fontWeight: "bold" }}>{record.profileName}</p>
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button
                    type="default"
                    onClick={() => handleCaretakerClick(record.caretaker, record.profileName)}
                    className="prevent-row-click"
                    style={{
                        fontSize: "1rem",
                        width: "100%",
                        maxWidth: "400px",
                    }}
                >
                    Bekijk begeleider profiel <UserOutlined/>
                </Button>
            ),
        },
    ];

    const dataSource = filteredContacts.map(contact => ({
        chatroomId: contact.id,
        id: contact.profileId,
        profileName: contact.profileName,
        profilePicture: contact.profilePicture,
        caretaker: contact.caretaker,
        isSender: contact.isSender
    }));

    function handleClientClick(record) {
        const profileData = {
            name: record.profileName,
            profilePicture: record.profilePicture,
            user_id: userID,
            otherUserId: record.id,
            isSender: record.isSender,
            chatroomId: record.chatroomId,
        };
        navigate('/chat', {state: {profileData}})
    }

    return (
        <div>
            <Input.Search
                placeholder="Zoeken in de contacten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginBottom: "20px", width: "100%" }}
                allowClear
            />
            {filteredContacts.length > 0 ? (
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    showHeader={false}
                    rowKey="id"
                    pagination={{ pageSize: pageSize }}
                    style={{ marginTop: "20px" }}
                    onRow={(record) => ({
                        onClick: (event) => {
                            // Prevent clicks on select and buttons from triggering row click
                            if (!event.target.closest(".prevent-row-click")) {
                                handleClientClick(record);
                            }
                        },
                    })}
                    rowClassName="clickable-row"
                />
            ) : (
                <p>Geen contacten gevonden</p>
            )}
            {/* Modal to display caretaker details */}
            <Modal
                title={`Contact gegevens begeleiding van ${clientName}`}
                open={isModalVisible}
                footer={null}
                onCancel={() => setIsModalVisible(false)}
                width="90%"
            >
                {selectedCaretakerId && <ProfileCard actCode={selectedCaretakerId} />}
            </Modal>
        </div>
    );
};

export default ContactsOverview;
