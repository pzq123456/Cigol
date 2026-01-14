import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex flex-row items-center justify-center gap-4 mb-8">
      <div className="relative group">
        <div className="absolute inset-0 bg-[#F97316] rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
        
        <Image
          src="/logo.svg"
          alt="cigol.dev Logo"
          width={48}
          height={48}
          className="w-12 h-12 md:w-16 md:h-16 object-contain relative z-10"
          priority
        />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#F97316] bg-[length:200%_auto] animate-gradient-x">
        cigol.dev
      </h1>
    </div>
  );
}