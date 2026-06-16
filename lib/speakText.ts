export const speakText = ( text: string, selectedVoice?: string) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const voice =
        voices.find(v => v.name === selectedVoice) ||
        voices.find(v => v.name.includes("Alex")) ||
        voices[0];

    if (voice) {
        utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
};