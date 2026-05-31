import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 justify-center items-center">
      {/* Brutalist Directory Box */}
      <div className="w-full max-w-2xl border border-black bg-white p-6 md:p-8">
        {/* Technical Header */}
        <div className="flex justify-between items-center border-b border-black pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-widest">SPACE.GEMS // DIRECTORY_INDEX</h1>
          <span className="font-mono-tech text-xs bg-black text-white px-2 py-0.5">V1.0.0_SYS</span>
        </div>

        <p className="text-sm text-zinc-600 mb-8 lowercase tracking-normal normal-case leading-relaxed">
          Welcome to the Space.Gems audio delivery terminal. This server routes secure, high-definition audio playback assets directly to A&R managers and creative partners. No drop shadows. No gradients. Pure transmission.
        </p>

        {/* Directory Table */}
        <div className="border border-black overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black bg-zinc-100">
                <th className="p-3 border-r border-black font-semibold">SHARE_ID</th>
                <th className="p-3 border-r border-black font-semibold">ARTIST</th>
                <th className="p-3 border-r border-black font-semibold">STATUS</th>
                <th className="p-3 font-semibold">LINK</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="p-3 border-r border-black font-mono-tech">space-gems-vol1</td>
                <td className="p-3 border-r border-black font-mono-tech">METAGHETTO</td>
                <td className="p-3 border-r border-black text-[#ff3b30]">ACTIVE [ REC ]</td>
                <td className="p-3 font-mono-tech">
                  <Link 
                    href="/share/space-gems-vol1" 
                    className="inline-block text-black font-bold hover:bg-black hover:text-white px-2 py-1 border border-black transition-colors"
                  >
                    [ ACCESS_SHARE ]
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Technical Note */}
        <div className="mt-8 pt-4 border-t border-zinc-200 flex justify-between text-[10px] text-zinc-400 font-mono-tech">
          <span>HOST: SPACE.GEMS_SECURE_ROUTER</span>
          <span>LOC: /SHARE/[SLUG]/PAGE.TSX</span>
        </div>
      </div>
    </div>
  );
}
