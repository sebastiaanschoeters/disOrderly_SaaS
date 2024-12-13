import React, { useState, useRef, useEffect } from 'react';
import {Avatar, Input, Button, ConfigProvider, Card, message, Breadcrumb} from 'antd';
import {useNavigate, useLocation, Link} from 'react-router-dom';
import {ArrowDownOutlined, PlusOutlined, SendOutlined} from '@ant-design/icons';
import {antThemeTokens, ButterflyIcon, ButterflyIconSmall, themes} from '../../Extra components/themes';
import { createClient } from "@supabase/supabase-js";
import BreadcrumbComponent from "../../Extra components/BreadcrumbComponent";
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad } from '@fortawesome/free-solid-svg-icons';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ChatPage = () => {
    const caretaker = localStorage.getItem('controlling');
    const userType = localStorage.getItem('userType');
    console.log("usertype:", userType)
    const location = useLocation();
    const {profileData} = location.state || {};
    const {name, profilePicture, chatroomId, otherUserId, isAdmin} = profileData || {};
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const userId = parseInt(localStorage.getItem('user_id'), 10);
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
        if(localStorage.getItem('userType') === "user"){
            navigate("/home");
            message.error({content: "deze pagina is niet beschikbaar via deze link", style:{fontSize:'20px'}});
        }
        else if(localStorage.getItem('userType') === "caretaker"){
            navigate("/clienten_overzicht");
            message.error({content: "deze pagina is niet beschikbaar via deze link", style:{fontSize:'20px'}});
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
        console.log("Sending message:", messageContent);
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
                message_content: messageContent,
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

        setNewMessage("");
        scrollToBottom();
    };

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
            width: '80%',
            minWidth: '350px',
            maxWidth: '800px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: themeColors.primary3,
            display: 'flex',
            flexDirection: 'column',
        },
        chatContainer: {
            padding: '10px',
            height: '70dvh',
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
            marginRight: '5px',
            marginLeft: '5px',
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
                zIndex: '0',
                overflow: 'hidden'
                }}
            >
                {userType !== "caretaker" && userType !== "admin" && (<BreadcrumbComponent />)}

                <ButterflyIcon color={themeColors.primary3} />

                <Card style={styles.card} bordered >
                    <div style={styles.chatContainer}>
                        <div style={{...styles.header,
                            cursor: isAdmin ? 'default' : 'pointer'}}
                            onClick={isAdmin ? null : () => handleProfileClick(otherUserId, setSelectedClient, setIsModalProfileVisible)}>
                            <Avatar
                                src={profilePicture || 'default-avatar.png'}
                                style={styles.avatar}
                            >
                                U
                            </Avatar>
                            <h2 style={{margin: 0, fontSize: '1.5rem', color: themeColors.primary1}}>
                                {`${name}`}
                            </h2>
                        </div>
                        <div style={styles.messageList} className={'messageList'} ref={messageListRef} onScroll={handleScroll}>
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
                                    <strong>verder laden</strong>
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
                                    {(userType !== "admin" && isAdmin &&
                                        <div>
                                            <div style={{
                                                textAlign: 'center',
                                                margin: '10px 0',
                                                color: themeColors.primary8
                                            }}>
                                                <strong>{new Date().toLocaleDateString()}</strong>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        ...styles.bubble,
                                                        ...styles.receiverBubble,
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <p style={{ margin: 0 }}>
                                                        Hey, dit is de helpdesk! Ondervind je een probleem met onze service, stuur dan hier uw vraag.
                                                    </p>
                                                </div>
                                                <span
                                                    style={{
                                                        ...styles.timestamp,
                                                        alignSelf: 'flex-start',
                                                    }}
                                                >
                                        {new Date().toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                            </div>
                                        </div>
                                    )}
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
                                                        const butterflyImages = [butterfly0, butterfly1, butterfly2, butterfly3, butterfly4, butterfly5];
                                                        const contentAfterIcon = message.message_content.slice(13).trim();

                                                        const indexMatch = contentAfterIcon.match(/^(\d+)\s*(.*)$/);
                                                        const index = indexMatch ? parseInt(indexMatch[1], 10) : NaN;
                                                        const title = indexMatch ? indexMatch[2] : "";

                                                        const [mainTitle, extraContent] = title.split('!').map(part => part.trim());

                                                        if (!isNaN(index) && index >= 0 && index < butterflyImages.length) {
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

                                                        return <p style={{ margin: 0 }}>{message.message_content}</p>;
                                                    })() : (
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
                        {userType !== "caretaker" &&(
                            <div style={styles.inputContainer}>
                                {!isAdmin && userType !== "admin"&& (
                                    <Button
                                        type="primary"
                                        style={styles.sendButton}
                                        icon={<FontAwesomeIcon icon={faGamepad} />}
                                        onClick={handleHangman}
                                    />
                                )}
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