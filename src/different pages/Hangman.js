import React, { useState } from 'react';
import { Modal, Button, Input, Typography, Space } from 'antd';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://flsogkmerliczcysodjt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc29na21lcmxpY3pjeXNvZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTEyODYsImV4cCI6MjA0NDgyNzI4Nn0.5e5mnpDQAObA_WjJR159mLHVtvfEhorXiui0q1AeK9Q'
);

const { Title, Text, Paragraph } = Typography;

const ButterflyHangman = ({ visibleSteps, wrongGuesses }) => {
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
        <svg className="butterfly-hangman" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {paths.map((d, index) => (
                <path
                    key={index}
                    d={d}
                    stroke={getColorForStep(index)}  // Get the color for each path based on wrong guesses
                    strokeOpacity="0.9"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: index < visibleSteps ? "block" : "none" }}  // Only show visible steps
                />
            ))}
        </svg>
    );
};



const HangmanGame = () => {
    const [step, setStep] = useState(1); // 1: Question, 2: Answer, 3: Hangman Game
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const maxWrong = 5;

    const handleGuess = (letter) => {
        if (guessedLetters.includes(letter)) return;
        setGuessedLetters([...guessedLetters, letter]);

        if (!answer.toUpperCase().includes(letter)) {
            setWrongGuesses(wrongGuesses + 1);
        }
    };

    const renderWord = () => {
        return answer.split('').map((letter) => {
            return guessedLetters.includes(letter.toUpperCase()) ? letter : '_';
        }).join(' ');
    };

    const isGameOver = wrongGuesses >= maxWrong;
    const isGameWon = answer.split('').every((letter) => guessedLetters.includes(letter.toUpperCase()));

    return (
        <div>
            {step === 1 && (
                <Modal
                    title="Stel een vraag (Player 1)"
                    open={true}
                    footer={null}
                    onCancel={() => {}}
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="Typ hier je vraag..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                    <Button type="primary" style={{ marginTop: 10 }} onClick={() => setStep(2)}>
                        Vraag instellen
                    </Button>
                </Modal>
            )}

            {step === 2 && (
                <Modal
                    title={`Vraag: ${question} (Player 2)`}
                    open={true}
                    footer={null}
                    onCancel={() => {}}
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
                        onClick={() => setStep(3)}
                        disabled={ !answer || !/^[a-zA-Z]*$/.test(answer) }
                    >
                        Antwoord instellen
                    </Button>
                </Modal>
            )}

            {step === 3 && (
                <Modal
                    title={`Vraag: ${question}`}
                    open={true}
                    footer={null}
                    onCancel={() => {}}
                >
                    <Typography>
                        <Title level={4}>Het woord:</Title>
                        <Paragraph>
                            <Text code>{renderWord()}</Text>
                        </Paragraph>
                        <Paragraph>
                            <Text>Fouten: {wrongGuesses}/{maxWrong}</Text>
                        </Paragraph>
                    </Typography>

                    <div style={{textAlign: 'center', marginBottom: 20}}>
                        <ButterflyHangman visibleSteps={wrongGuesses} wrongGuesses={wrongGuesses} />
                    </div>

                    <Space wrap>
                        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
                            <Button
                                key={letter}
                                onClick={() => handleGuess(letter)}
                                disabled={guessedLetters.includes(letter)}
                            >
                                {letter}
                            </Button>
                        ))}
                    </Space>

                    <Typography style={{marginTop: 16}}>
                        {isGameWon && <Text type="success">Gefeliciteerd! Je hebt gewonnen!</Text>}
                        {isGameOver && <Text type="danger">Jammer! Het juiste antwoord was: {answer}</Text>}
                        {!isGameWon && !isGameOver && <Text>Blijf raden!</Text>}
                    </Typography>

                    <Button
                        type="primary"
                        style={{marginTop: 16}}
                        onClick={() => {
                            setStep(1);
                            setGuessedLetters([]);
                            setWrongGuesses(0);
                            setQuestion('');
                            setAnswer('');
                        }}
                    >
                        Opnieuw spelen
                    </Button>
                </Modal>
            )}
        </div>
    );
};

export default HangmanGame;