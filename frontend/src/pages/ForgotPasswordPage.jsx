import { useState } from 'react';

import { ForgotPasswordCard } from '../features/user/ForgotPasswordCard';
import { ResetPasswordCard } from '../features/user/ResetPasswordCard';

export const ForgotPasswordPage = () => {
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [countdown, setCountdown] = useState(0);

    const handleCodeSent = (sentEmail, cooldownRemaining) => {
        setEmail(sentEmail);
        setCountdown(cooldownRemaining);
        setStep('reset');
    };

    return (
        <div style={{ height: '100vh' }}>
            {step === 'email'
                ? <ForgotPasswordCard onCodeSent={handleCodeSent} />
                : <ResetPasswordCard email={email} initialCountdown={countdown} />}
        </div>
    );
};
