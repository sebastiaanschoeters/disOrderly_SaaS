import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {Avatar, Button, ConfigProvider, Modal, Select, Table, Input} from "antd";
import {DeleteOutlined, ProfileOutlined, UserOutlined} from "@ant-design/icons";
import ProfileCard from "./CaretakerProfilePage";

const supabase = createClient(
    "https://flsogkmerliczcysodjt.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q"
);

const useContacts = (userID) => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const fetchChatrooms = async () => {
            const { data, error } = await supabase
                .from('Chatroom')
                .select('id, sender_id, receiver_id, acceptance, senderProfile: sender_id(name, profile_picture, caretaker), receiverProfile: receiver_id(name, profile_picture, caretaker)')
                .or(`sender_id.eq.${userID},receiver_id.eq.${userID}`);

            if (error) {
                console.error('Error fetching chatrooms:', error);
            } else {
                const formattedContacts = data.map((chat) => {
                    const profile =
                        chat.sender_id === userID ? chat.receiverProfile : chat.senderProfile;

                    return {
                        ...chat,
                        profileName: profile.name,
                        profilePicture: profile.profile_picture,
                        caretaker: profile.caretaker
                    };
                });
                setContacts(formattedContacts);
            }
        };

        fetchChatrooms();
    }, [userID]);

    return { contacts };
};

const ContactsOverview = ({ id: userID }) => {
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
            const headerHeight = 180; // Approximate header and padding
            const footerHeight = 50; // Approximate footer height
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
        console.log("caretaker clicked:", caretaker)
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
        id: contact.id,
        profileName: contact.profileName,
        profilePicture: contact.profilePicture,
        caretaker: contact.caretaker,
    }));

    console.log(filteredContacts)
    console.log(dataSource)

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
                    pagination={{ pageSize }}
                    style={{ marginTop: "20px" }}
                />
            ) : (
                <p>Loading contacts...</p>
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
