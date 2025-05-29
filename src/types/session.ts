export interface sessionUser {
  user: {
    name: string | null;
    email: string;
    image: string;
    id: string;
    noWhatsapp: string | null;
    idTelegram: string | null;
    emailVerified: string | null;
  };
  expires: string;
}
