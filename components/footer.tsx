import Image from "next/image";

const Footer = () => (
    <footer className="mt-auto border-t py-3 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Image
                    src="/images/FlashRead.png"
                    alt="FlashRead"
                    width={20}
                    height={20}
                    className="sm:w-[22px] sm:h-[22px]"
                />
                <span className="font-semibold text-sm">FlashRead</span>
            </div>
            <p className="text-xs text-muted-foreground">Developed by Fred Juma</p>
        </div>
    </footer>
);

export default Footer;