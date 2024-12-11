import React, { useState, useRef, useEffect } from 'react';
import {Avatar, Input, Button, ConfigProvider, Card, message} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {ArrowDownOutlined, PlusOutlined, SendOutlined} from '@ant-design/icons';
import {antThemeTokens, ButterflyIcon, ButterflyIconSmall, themes} from '../../Extra components/themes';
import { createClient } from "@supabase/supabase-js";
import '../../CSS/ChatPage.css';
import HomeButtonUser from "../../Extra components/HomeButtonUser";
import HangmanGame from "./Hangman";
import useTheme from "../../UseHooks/useTheme";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";
import butterfly0 from '../../Media/butterfly0.png';
import butterfly1 from '../../Media/butterfly1.png';
import butterfly2 from '../../Media/butterfly2.png';
import butterfly3 from '../../Media/butterfly3.png';
import butterfly4 from '../../Media/butterfly4.png';
import butterfly5 from '../../Media/butterfly5.png';
import ProfileDetailsModal from "../Profile Pages/ProfileDetailsModal";
import {handleModalProfileClose, handleProfileClick} from "../../Api/Utils";



const supabase = createClient("https://flsogkmerliczcysodjt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q")

const ChatPage = () => {
    const caretaker = localStorage.getItem('controlling');
    const userType = localStorage.getItem('userType');
    console.log("usertype:", userType)
    const location = useLocation();
    const {profileData} = location.state || {};
    const {name, profilePicture, chatroomId, otherUserId, user_id} = profileData || {};
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const userId = user_id
    // const userId = parseInt(localStorage.getItem('user_id'), 10);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const localTime = new Date();

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [themeName, darkModeFlag] = JSON.parse(localStorage.getItem('theme')) || ['blauw', false];
    const { themeColors, setThemeName, setDarkModeFlag } = useTheme(themeName, darkModeFlag);

    useThemeOnCSS(themeColors);

    const dummyRef = useRef(null);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
    const messageListRef = useRef(null);
    const [noMoreMessages,setNoMoreMessages] = useState(false);

    const [isModalProfileVisible, setIsModalProfileVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState({});

    if(!chatroomId){
        if(localStorage.getItem('userType') == "user"){
            navigate("/home");
            message.error("deze pagina is niet beschikbaar via deze link");
        }
        else if(localStorage.getItem('userType') == "caretaker"){
            navigate("/clientOverview");
            message.error("deze pagina is niet beschikbaar via deze link");
        }
        else {
            navigate("/login");
        }
    }

    const fetchMessages = async (limit = 10, start = 0) => {
        if (loadingMore) return;

        setLoadingMore(true);
        const {data, error} = await supabase
            .from('Messages')
            .select('id, sender_id, created_at, message_content')
            .eq('chatroom_id', chatroomId)
            .order('created_at', {ascending: false})
            .range(start, start + limit - 1);

        if (error) {
            console.error("Error fetching messages:", error);
            setLoadingMore(false);
            return;
        }
        if (data) {
            setMessages((prevMessages) => {
                const uniqueMessages = [...data, ...prevMessages].filter(
                    (msg, index, self) =>
                        index === self.findIndex((m) => m.id === msg.id)
                );
                return uniqueMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
        }
        setLoadingMore(false);
        setNoMoreMessages(data.length < limit);
    };

    useEffect(() => {
        fetchMessages();
        const channel = supabase
            .channel(`realtime:Messages:${chatroomId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'Messages' , filter: `chatroom_id=eq.${chatroomId}`  },
                (payload) => {
                    console.log("New message payload", payload);
                    setMessages(prevMessages => [...prevMessages,payload.new]);
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    },[chatroomId]);

    useEffect(() => {
        if (isScrolledToBottom) {
            scrollToBottom();
        }
    }, [messages]);

    const handleScroll = () => {
        if (messageListRef.current) {
            const scrollHeight = messageListRef.current.scrollHeight;
            const scrollTop = messageListRef.current.scrollTop;
            const clientHeight = messageListRef.current.clientHeight;

            // Calculate the distance from the bottom
            const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

            setIsScrolledToBottom(distanceFromBottom <= 80);
        }
    };

    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTo({
                top: messageListRef.current.scrollHeight,
                behavior: 'instant'
            });
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;

        const messageToSend = caretaker
            ? "Verzonder door begeleiding: " + newMessage
            : newMessage;

        const {error} = await supabase
            .from('Messages')
            .insert([{
                chatroom_id: chatroomId,
                sender_id: userId,
                message_content: messageToSend,
                created_at: localTime.toISOString()
            }]);

        if (error) {
            console.error("Error sending message:", error);
            return;
        }

        await supabase
            .from('Chatroom')
            .update({last_sender_id: userId})
            .eq('id', chatroomId);

        setNewMessage("");
        scrollToBottom();
    };

    const handleSendMessageArg = async (messageContent) => {
        console.log("Sending messageaaa:", messageContent);
        if (messageContent) {
            if (messageContent.trim() === "") return; {
            }
        } else {
            return;
        }

        const { error } = await supabase
            .from('Messages')
            .insert([{
                chatroom_id: chatroomId,
                sender_id: userId,
                message_content: messageContent, // Use the provided message content
                created_at: localTime.toISOString(),
            }]);

        if (error) {
            console.error("Error sending message:", error);
            return;
        }

        await supabase
            .from('Chatroom')
            .update({ last_sender_id: userId })
            .eq('id', chatroomId);

        setNewMessage(""); // Clear the message input if applicable
        scrollToBottom();  // Scroll to the bottom of the chat
    };


    // Function to group messages by date
    const groupMessagesByDate = (messages) => {
        return messages.reduce((groups, message) => {
            const date = new Date(message.created_at).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
            return groups;
        }, {});
    };

    const groupedMessages = groupMessagesByDate(messages);

    const handleLoadMore = () => {
        fetchMessages(10, messages.length);
    };

    // Function to handle when the "Start Game" button is clicked
    const handleHangman = () => {
        setIsModalVisible(true);
    };

    const styles = {
        background: {
            width: '100dvw',
            height: '100dvh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: themeColors.primary2,
        },
        card: {
            width: '90%',
            maxWidth: '650px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: themeColors.primary3,
            display: 'flex',
            flexDirection: 'column',
        },
        chatContainer: {
            padding: '20px',
            height: '80dvh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        header: {
            backgroundColor: themeColors.primary6,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
            marginBottom: '15px',
            width: '100%',
            position: 'relative',
        },
        avatar: {
            marginRight: '20px',
        },
        messageList: {
            flexGrow: 1,
            overflowY: 'auto',
            width: '100%',
            marginBottom: '15px',
            display: 'flex',
            flexDirection: 'column',
        },
        bubble: {
            maxWidth: '70%',
            padding: '10px 15px',
            borderRadius: '20px',
            wordBreak: 'break-word',
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center',
        },
        senderBubble: {
            backgroundColor: themeColors.primary1,
            color: themeColors.primary10,
            alignSelf: 'flex-end',
            display: 'flex',
            alignItems: 'center',
        },
        receiverBubble: {
            backgroundColor: themeColors.primary4,
            color: themeColors.primary10,
            alignSelf: 'flex-start',
        },
        timestamp: {
            fontSize: '1rem',
            marginTop: '3px',
            alignSelf: 'flex-end',
            color: themeColors.primary8,
        },
        inputContainer: {
            display: 'flex',
            alignItems: 'center',
            marginTop: '10px',
            width: '100%',
        },
        input: {
            flex: 1,
            marginRight: '10px',
            height: '40px',
            borderRadius: '5px',
        },
        sendButton: {
            height: '40px',
            padding: '0 15px',
            borderRadius: '5px',
        },
        scrollButton: {
            position: 'absolute',
            bottom: '100px',
            left: '47%',
            backgroundColor: themeColors.primary8,
            color: themeColors.primary1,
            display: isScrolledToBottom ? 'none' : 'flex',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
        },
    };

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div style={{
                padding: '20px',
                position: 'relative',
                minWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                minHeight: '100dvh',
                backgroundColor: themeColors.primary2,
                color: themeColors.primary10,
                width: '100%',
                boxSizing: 'border-box',
                zIndex: '0'
                }}
            >
                {userType !== "caretaker" && (<HomeButtonUser color={themeColors.primary7} />)}

                <ButterflyIcon color={themeColors.primary3} />

                <Card style={styles.card} bordered>
                    <div style={styles.chatContainer}>
                        <div style={styles.header}>
                            <Avatar
                                src={profilePicture || 'default-avatar.png'}
                                style={styles.avatar}
                                onClick={() => handleProfileClick(otherUserId, setSelectedClient, setIsModalProfileVisible)}
                            >
                                U
                            </Avatar>
                            <h2 style={{margin: 0, fontSize: '1.5rem', color: themeColors.primary1}}>
                                {`${name}`}
                            </h2>
                        </div>
                        <div style={styles.messageList} ref={messageListRef} onScroll={handleScroll}>
                            {!loadingMore && !noMoreMessages && (
                                <p
                                    onClick={handleLoadMore}
                                    style={{
                                        textAlign: 'center',
                                        color: themeColors.primary8,
                                        cursor: 'pointer',
                                        padding: '10px',
                                        marginTop: '5px',
                                    }}
                                >
                                    <strong>Load More</strong>
                                </p>

                            )}
                            {Object.keys(groupedMessages).map((date) => (
                                <div key={date}>
                                    <div style={{
                                        textAlign: 'center',
                                        margin: '10px 0',
                                        color: themeColors.primary8
                                    }}>
                                        <strong>{date}</strong>
                                    </div>
                                    {groupedMessages[date].map((message) => {
                                        const isSender = message.sender_id === userId;
                                        return (
                                            <div
                                                key={message.id}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: isSender ? 'flex-end' : 'flex-start',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        ...styles.bubble,
                                                        ...(isSender ? styles.senderBubble : styles.receiverBubble),
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {message.message_content && typeof message.message_content === 'string' && message.message_content.startsWith("ButterflyIcon") ? (() => {
                                                        const butterflyImages = [butterfly0, butterfly1, butterfly2, butterfly3, butterfly4, butterfly5]; // Add your local image paths
                                                        const contentAfterIcon = message.message_content.slice(13).trim(); // Get everything after "ButterflyIcon"

                                                        // Extract index and title
                                                        const indexMatch = contentAfterIcon.match(/^(\d+)\s*(.*)$/); // Regex to extract number and text
                                                        const index = indexMatch ? parseInt(indexMatch[1], 10) : NaN; // First part is the index
                                                        const title = indexMatch ? indexMatch[2] : ""; // Rest is the title

                                                        // Split title at "!" if exists
                                                        const [mainTitle, extraContent] = title.split('!').map(part => part.trim());

                                                        if (!isNaN(index) && index >= 0 && index < butterflyImages.length) {
                                                            // Valid index: render title, image, and content after "!"
                                                            return (
                                                                <div style={{ textAlign: "center" }}>
                                                                    {mainTitle && <p style={{ margin: 0, fontWeight: "bold" }}>{mainTitle + '!'}</p>}
                                                                    <img
                                                                        src={butterflyImages[index]}
                                                                        alt={`Butterfly Icon ${index}`}
                                                                        style={{
                                                                            width: "100px",
                                                                            height: "100px",
                                                                            marginTop: mainTitle ? "5px" : "0",
                                                                        }}
                                                                    />
                                                                    {extraContent && <p style={{ margin: 0, marginTop: "5px" }}>{extraContent}</p>}
                                                                </div>
                                                            );
                                                        }

                                                        // Invalid index or no number: display the plain text
                                                        return <p style={{ margin: 0 }}>{message.message_content}</p>;
                                                    })() : (
                                                        // Default case: display plain text
                                                        <p style={{ margin: 0 }}>{message.message_content}</p>
                                                    )}
                                                </div>
                                                <span
                                                    style={{
                                                        ...styles.timestamp,
                                                        alignSelf: isSender ? 'flex-end' : 'flex-start',
                                                    }}
                                                >
                                                    {new Date(message.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        );
                                    })}

                                </div>
                            ))}
                            <Button
                                style={styles.scrollButton}
                                onClick={scrollToBottom}
                                icon={<ArrowDownOutlined/>}
                                hidden={isScrolledToBottom}
                            />
                            <div ref={dummyRef}/>
                        </div>
                        {userType !== "caretaker" && (
                            <div style={styles.inputContainer}>
                                <Button type="primary"
                                        style={styles.sendButton}
                                        icon={<PlusOutlined/>}
                                        onClick={handleHangman}/>
                                <Input
                                    style={styles.input}
                                    placeholder="Type hier..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onPressEnter={handleSendMessage}
                                />
                                <Button type="primary" style={styles.sendButton} icon={<SendOutlined/>}
                                        onClick={handleSendMessage}/>
                            </div>
                        )}

                    </div>
                </Card>
            </div>
            {isModalVisible && (
                <HangmanGame
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    player1Id = {userId}
                    player2Id = {otherUserId}
                    handleSendMessage = {handleSendMessageArg}
                />
            )}

            {selectedClient && (
                <ProfileDetailsModal
                    visible={isModalProfileVisible}
                    onClose={()=> handleModalProfileClose(setSelectedClient, setIsModalProfileVisible)}
                    clientData={selectedClient}
                />
            )}
        </ConfigProvider>
    );
};


export default ChatPage;