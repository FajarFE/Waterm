import React from "react";

interface WhatsAppChatProps {
	numberPhone: string;
	message: string;
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
	numberPhone,
	message,
}) => {
	// Hapus karakter non-digit dari nomor telepon
	const cleanedPhoneNumber = numberPhone.replace(/\D/g, "");

	// Encode pesan template untuk URL
	const encodedMessage = encodeURIComponent(message);

	// Buat tautan WhatsApp dengan pesan template
	const whatsappLink = `https://wa.me/${cleanedPhoneNumber}?text=${encodedMessage}`;

	return (
		<a
			href={whatsappLink}
			className='w-full flex'
			target='_blank'
			rel='noopener noreferrer'>
			Chat di WhatsApp
		</a>
	);
};

export default WhatsAppChat;
