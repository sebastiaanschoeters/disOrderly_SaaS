import React, {useEffect, useState} from 'react';
import {Modal, Button, Spin, Input, Typography, Space, message} from 'antd';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { Title, Text, Paragraph } = Typography;

const ButterflyHangman = ({ wrongGuesses }) => {
    const paths = [
        "M179.222 296.039C171.929 321.836 117.118 349.829 100.868 317.327C83.9601 283.513 128.707 258.291 155.272 253.461",
        "M154.089 255.235C140.063 256.692 126.178 245.826 114.468 239.268C74.9513 217.139 49.2305 174.06 54.7419 127.208C60.5666 77.6967 120.975 104.935 142.262 123.068C160.693 138.769 174.617 160.101 184.839 181.908C193.152 199.64 200.112 214.666 205.536 233.651",
        "M211.746 221.528C216.22 203.929 220.6 185.643 227.417 168.602C234.927 149.827 243.612 130.546 256.097 114.494C267.281 100.115 309.676 53.8821 331.79 73.9865C338.609 80.1856 341.437 92.7089 343.321 101.189C355.43 155.676 303.486 234.412 246.044 240.156",
        "M249.001 238.972C282.8 227.116 321.478 272.606 305.179 305.204C286.258 343.046 248.409 334.476 215.589 283.62",
        "M205.537 171.56C213.34 215.845 203.3 268.936 199.919 312.892"
    ];

    // Function to get the stroke color based on the number of wrong guesses
    const getColorForStep = (index) => {
        // Set the initial color to light gray
        const lightColor = "#D3D3D3";
        // Calculate the darker color based on the number of wrong guesses
        const darkColor = "#000000"; // Fully dark color for completed paths

        // If wrongGuesses is greater than or equal to the index, we apply the dark color, otherwise light color
        return wrongGuesses > index ? darkColor : lightColor;
    };

    return (
        <svg className="butterfly-hangman" viewBox="0 0 400 400" width="200" height="200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {paths.map((d, index) => (
                <path
                    key={index}
                    d={d}
                    stroke={getColorForStep(index)}  // Get the color for each path based on wrong guesses
                    strokeOpacity="0.9"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ))}
        </svg>
    );
};

const generateConversationStarter = async () => {
    /*try {
        const response = await fetch('/api/generateQuestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: "Generate a fun and creative conversation starter question in Dutch with a one word answer.",
            }),
        });

        const data = await response.json();
        return data.question || "Wat is jouw lievelingseten?"; // Fallback question
    } catch (error) {
        console.error("Error generating conversation starter:", error);
        return "Wat is jouw lievelingseten?"; // Fallback question
    }*/
    const randt = Math.floor(Math.random() * 99) + 1;

    const { data, error } = await supabase
        .from('Vragen')
        .select('vragen')
        .eq('id', randt)

    if (error) {
        console.error('Error fetching random question:', error.message);
        return null;
    }

    return data?.[0]?.vragen || "Wat is jouw lievelingseten?";
};


const HangmanGame = ({ isModalVisible, setIsModalVisible, player1Id, player2Id, handleSendMessage }) => {
    const [gameId, setGameId] = useState(null);
    const [step, setStep] = useState(null); // 1: Question, 2: Answer, 3: Hangman Game
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const maxWrong = 5;
    const [isSender, setIsSender] = useState(false);
    const userId = parseInt(localStorage.getItem('user_id'), 10);

    const fetchGameState = async (player1Id, player2Id) => {
        const {data, error} = await supabase
            .from('Hangman')
            .select('*')
            .or(`and(player_1_id.eq.${player1Id},player_2_id.eq.${player2Id}),and(player_1_id.eq.${player2Id},player_2_id.eq.${player1Id})`)
            .single();

        if (error) {
            console.error('Error fetching game state:', error);
            setStep(1);
            setIsSender(true);
            return;
        }

        if (data) {
            setGameId(data.id);
            setStep(data.current_step);
            setQuestion(data.question || '');
            setAnswer(data.answer || '');
            setGuessedLetters(data.guessed_letters || []);
            setWrongGuesses(data.wrong_guesses || 0);
            setIsSender(userId === data.player_1_id);
        }
    }

    useEffect(() => {
        if (player1Id && player2Id) {
            fetchGameState(player1Id, player2Id);
        }
    }, [player1Id, player2Id]);

    const renderWord = () => {
        return answer.split('').map((letter) => {
            return guessedLetters.includes(letter.toUpperCase()) ? letter : '_';
        }).join(' ');
    };

    const startNewGame = async (question) => {
        // Step 1: Check if a game already exists between these two players
        const { data: existingGame, error: fetchError } = await supabase
            .from('Hangman')
            .select('id')
            .or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`)
            .or(`player_2_id.eq.${player2Id},player_1_id.eq.${player2Id}`)
            .limit(1); // We only care if there's at least one game

        if (fetchError) {
            console.error('Error checking for existing game:', fetchError);
            return;
        }

        if (existingGame && existingGame.length > 0) {
            console.log('A game already exists between these players:', existingGame[0].id);
            message.error('De andere persoon heeft al een nieuw spel gestart');
            return; // Do not create a new game
        }

        // Step 2: If no existing game, proceed to create a new game
        const { data, error } = await supabase
            .from('Hangman')
            .insert([
                {
                    player_1_id: userId,
                    player_2_id: player2Id,
                    question: question,
                    guessed_letters: [],
                    wrong_guesses: 0,
                    current_step: 2,
                }
            ])
            .select('id');

        if (error) {
            console.error('Error starting new game:', error);
            return;
        }

        // Step 3: Update state and UI
        setGameId(data[0].id);
        setIsModalVisible(false);
        setStep(2);

        // Step 4: Notify players about the new game
        handleSendMessage("ButterflyIcon0 " + localStorage.getItem('name') + " heeft een nieuw spel gestart! Klik links onderaan op de + om te spelen");

        return data; // Return the new game data
    };

    const handleAnswer = async (gameId, answer) => {
        const {data, error} = await supabase
            .from('Hangman')
            .update({
                answer: answer,
                current_step: 3
            })
            .eq('id', gameId)

        if (error) {
            console.error('Error saving answer:', error);
        }
        setIsModalVisible(false)
        handleSendMessage("ButterflyIcon0 " + localStorage.getItem('name') + " heeft de vraag beantwoord!Klik links onderaan op de + om te spelen")
        setStep(3)
        return answer
    };

// handleGuess function - simplified
    const handleGuess = (letter) => {
        // If the letter has already been guessed, do nothing
        if (guessedLetters.includes(letter)) return;

        // Update the guessed letters
        setGuessedLetters((prevGuessedLetters) => [...prevGuessedLetters, letter]);
    };

// useEffect to respond to state change in guessedLetters
    useEffect(() => {
        if(!isSender){
            return;
        }
        if (guessedLetters.length === 0) return;

        const letter = guessedLetters[guessedLetters.length - 1];  // Get the most recent guessed letter

        // Check if the guessed letter is correct or not
        if (answer.toUpperCase().includes(letter)) {
            if (handleSendMessage) {
                handleSendMessage(`ButterflyIcon${wrongGuesses} ${letter.toUpperCase()} is juist!` + renderWord());
            }
        } else {
            const newWrongGuesses = wrongGuesses + 1;
            setWrongGuesses(newWrongGuesses);

            if (handleSendMessage) {
                handleSendMessage(`ButterflyIcon${newWrongGuesses} ${letter.toUpperCase()} is fout!` + renderWord());
            }
        }

        // Update database with the new state
        handleGuessInDatabase(gameId, guessedLetters, wrongGuesses);
    }, [guessedLetters]); // Trigger when guessedLetters changes


    const handleGuessInDatabase = async (gameId, guessedLetters, currentWrongGuesses) => {
        const { data, error } = await supabase
            .from('Hangman')
            .update({
                guessed_letters: guessedLetters,
                wrong_guesses: currentWrongGuesses,
            })
            .eq('id', gameId); // Use game ID to identify which game to update

        if (error) {
            console.error('Error updating guess:', error);
        }

        return data;  // Return the updated game data
    };

    const handleGameEnd = async (gameId) => {
        const { data, error } = await supabase
            .from('Hangman')
            .delete()
            .eq('id', gameId); // Use game ID to update the correct game record

        if (error) {
            console.error('Error finishing game', error);
        }

        return data;
    };

    const handleGameWin = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            console.log(userId)
            // Fetch the current value of hangman_wins
            const { data: userData, error: fetchError } = await supabase
                .from('User information')
                .select('hangman_wins')
                .eq('user_id', userId)
                .single();

            if (fetchError) {
                console.error('Error fetching hangman_wins:', fetchError);
                return;
            }

            const currentWins = userData.hangman_wins || 0;

            // Increment the value locally
            const updatedWins = currentWins + 1;

            // Update the value in the database
            const { data, error: updateError } = await supabase
                .from('User information')
                .update({ hangman_wins: updatedWins })
                .eq('user_id', userId);

            if (updateError) {
                console.error('Error updating hangman_wins:', updateError);
                return;
            }

            console.log('Hangman win updated successfully:', data);
        } catch (error) {
            console.error('Unexpected error in handleGameWin:', error);
        }
    };

    const isGameOver = wrongGuesses >= maxWrong;
    const isGameWon = answer.split('').every((letter) => guessedLetters.includes(letter.toUpperCase()));

    useEffect(() => {
        if (isGameOver || isGameWon) {
            if (answer) {
                if (isGameWon) {
                    handleSendMessage(`ButterflyIcon${wrongGuesses} ` + localStorage.getItem('name') + " Heeft het antwoord geraden!" + renderWord());
                    handleGameWin()
                    setGameEnded(true);
                    return;
                } else {
                    handleSendMessage(`ButterflyIcon${wrongGuesses} ` + localStorage.getItem('name') + " Heeft het antwoord niet geraden!" + `Het juiste antwoord was ${answer}`);
                }
                setGameEnded(true);
            }
        }
    }, [isGameOver, isGameWon]);

    useEffect(() => {
        if (gameEnded) {
            handleGameEnd(gameId);
            setGameEnded(false);
        }
    }, [gameEnded, gameId]);

    const handleCancel = () => {
        setIsModalVisible(false); // Close modal
    };

    return (
        <div>
            {step === 1 && isSender &&(
                <Modal
                    title="Typ hier een vraag, of laat een vraag genereren"
                    open={step === 1} // Modal visibility controlled by state
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="Typ hier je vraag..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                    <Space direction="horizontal" style={{ marginTop: 10 }}>
                        <Button
                            type="default"
                            onClick={async () => {
                                const generatedQuestion = await generateConversationStarter();
                                setQuestion(generatedQuestion);
                            }}
                        >
                            Genereer een vraag
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => startNewGame(question)}
                            disabled={!question} // Disable if the question is empty
                        >
                            Vraag instellen
                        </Button>
                    </Space>
                </Modal>
            )}

            {step === 2 && !isSender &&(
                <Modal
                    title={`Vraag: ${question} (Player 2)`}
                    open={step === 2} // Modal visibility controlled by state
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Input
                        placeholder="Typ hier het antwoord... (geen spaties)"
                        value={answer}
                        onChange={(e) => {
                            const input = e.target.value;
                            // Validate input: no spaces allowed
                            if (/^[a-zA-Z]*$/.test(input)) {
                                setAnswer(input);
                            }
                        }}
                    />
                    <Text type="danger" style={{ display: answer && /^[a-zA-Z]*$/.test(answer) ? 'none' : 'block' }}>
                        Het antwoord mag alleen letters bevatten, geen spaties of speciale tekens.
                    </Text>
                    <Button
                        type="primary"
                        style={{ marginTop: 10 }}
                        onClick={() => handleAnswer(gameId, answer)}
                        disabled={ !answer || !/^[a-zA-Z]*$/.test(answer) }
                    >
                        Antwoord instellen
                    </Button>
                </Modal>
            )}

            {step === 2 && isSender && (
                <Modal
                    title={`Wachtende op het antwoord van de ander`}
                    open={step === 2} // Modal visibility controlled by state
                    onCancel={handleCancel}
                    footer={null}
                >
                    <div style={{textAlign: 'center', marginTop: 20}}>
                        <Spin size="large"/> {/* You can adjust the size if needed */}
                    </div>
                </Modal>
            )}


            {step === 3 && isSender && (
                <Modal
                    title={`Vraag: ${question} `}
                    open={step === 3}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Typography style={{ marginTop: 16 }}>
                        {!isGameWon && !isGameOver && <Text>Blijf raden!</Text>}
                        {isGameWon && (
                            <Text type="success">Gefeliciteerd! Je hebt gewonnen!</Text>
                        )}
                        {isGameOver && !isGameWon && (
                            <Text type="danger">Jammer! Het juiste antwoord was: {answer}</Text>
                        )}
                    </Typography>
                    <Typography>
                        <Title level={4}>Het woord:</Title>
                        <Paragraph>
                            <Text code>{renderWord()}</Text>
                        </Paragraph>
                        <Paragraph>
                            <Text>Fouten: {wrongGuesses}/{maxWrong}</Text>
                        </Paragraph>
                    </Typography>

                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <ButterflyHangman wrongGuesses={wrongGuesses} />
                    </div>

                    <Space wrap>
                        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
                            <Button
                                key={letter}
                                onClick={() => handleGuess(letter)}
                                disabled={guessedLetters.includes(letter) || !isSender}
                            >
                                {letter}
                            </Button>
                        ))}
                    </Space>
                </Modal>
            )}
            {step === 3 && !isSender && (
                <Modal
                    title={`De andere persoon is jouw antwoord aan het zoeken`}
                    open={step === 3} // Modal visibility controlled by state
                    onCancel={handleCancel}
                    footer={null}
                >
                    <div style={{textAlign: 'center', marginTop: 20}}>
                        <Spin size="large"/> {/* You can adjust the size if needed */}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default HangmanGame;
