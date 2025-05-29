import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@skripsi/components';
import { RxAvatar } from 'react-icons/rx';
import { cn } from '@skripsi/libs';

export default function AuthButtons() {
  const session = useSession();

  if (!session.data?.user) {
    return (
      <div className="lg:flex md:flex hidden justify-center items-center md:gap-2 gap-5">
        <Link href="/signin" className="...">
          {' '}
          Signin{' '}
        </Link>
        <Link href="/signup" className="...">
          {' '}
          Get Started{' '}
        </Link>
      </div>
    );
  }

  return (
    <Link href="/dashboard/monitoring" className={cn('')}>
      <Avatar>
        <AvatarImage
          src={session.data.user.image ?? ''}
          alt={session.data.user.name ?? ''}
        />
        <AvatarFallback>
          <RxAvatar />
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
