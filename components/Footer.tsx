import React from 'react';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface FooterProps {
    theme: Theme;
}

const Footer: React.FC<FooterProps> = ({ theme }) => {
    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';
    
    const footerClasses = isGlass
        ? "bg-transparent text-slate-400 mt-12 border-t border-slate-700/50"
        : isNeumorphic
        ? "bg-transparent text-gray-500 mt-12 border-t border-gray-300/50"
        : "bg-transparent text-gray-700 mt-12 border-t-2 border-black";
    const linkClasses = isGlass ? "hover:text-sky-400 transition-colors" : isNeumorphic ? "hover:text-blue-600 transition-colors" : "hover:text-blue-600 transition-colors font-medium";
    const emailLinkClasses = isGlass ? "text-sky-400 hover:underline" : "text-blue-600 hover:underline";
    const borderColor = isGlass ? "border-slate-700/50" : isNeumorphic ? "border-gray-300/50" : "border-black";

    return (
        <footer className={footerClasses}>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-y-8">
                    {/* LEFT SIDE: Title and Nav Links */}
                    <div className="flex-shrink-0 space-y-4">
                        <img 
                            src="https://r2-images.dacon.co.kr/external/dacon-logo.svg" 
                            alt="DACON Logo" 
                            className="h-[18px] opacity-80"
                        />
                        <div className="flex flex-wrap justify-start items-center gap-x-6 gap-y-2">
                            <a href="https://dacon.io/more/notice/89" target="_blank" rel="noopener noreferrer" className={linkClasses}>이용약관</a>
                            <a href="https://dacon.io/forum/403890" target="_blank" rel="noopener noreferrer" className={linkClasses}>대회주최문의</a>
                            <a href="https://about.dacon.io" target="_blank" rel="noopener noreferrer" className={linkClasses}>서비스 소개</a>
                            <a href="https://dacon.io/forum/406358" target="_blank" rel="noopener noreferrer" className={linkClasses}>교육 문의</a>
                            <a href="https://dacon.io/community/hiring" target="_blank" rel="noopener noreferrer" className={linkClasses}>채용</a>
                        </div>
                    </div>
                    
                    {/* RIGHT SIDE: Links and Company Info */}
                    <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-y-6">
                         {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <a href="https://pf.kakao.com/_bmVkxj" target="_blank" rel="noopener noreferrer" aria-label="Dacon Kakao Channel">
                                <img src="https://dacon.io/_nuxt/img/footer_kakao.29c8bd6.svg" alt="Kakao logo" className="h-6 w-6 transition-opacity hover:opacity-75" />
                            </a>
                            <a href="https://www.instagram.com/daconio" target="_blank" rel="noopener noreferrer" aria-label="Dacon Instagram">
                                <img src="https://dacon.io/_nuxt/img/footer_instagram.f30fc61.svg" alt="Instagram logo" className="h-6 w-6 transition-opacity hover:opacity-75" />
                            </a>
                            <a href="https://www.youtube.com/@%EB%8D%B0%EC%9D%B4%EC%BD%98" target="_blank" rel="noopener noreferrer" aria-label="Dacon YouTube">
                                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAyMCAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNy44MTM2IDAuNDQ3NkMxOC42NzM5IDAuNjk0NCAxOS4zNTIzIDEuNDIwMiAxOS41ODE4IDIuMzQxOUMyMCA0LjAxMzcgMjAgNy41IDIwIDcuNUMyMCA3LjUgMjAgMTAuOTg3NSAxOS41ODE4IDEyLjY1ODFDMTkuMzUyMyAxMy41Nzk4IDE4LjY3MzkgMTQuMzA1NiAxNy44MTM2IDE0LjU1MjRDMTYuMjU0NSAxNSAxMCAxNSAxMCAxNUMxMCAxNSAzLjc0NjYgMTUgMi4xODY0IDE0LjU1MjRDMS4zMjYxIDE0LjMwNTYgMC42NDc3IDEzLjU3OTggMC40MTgyIDEyLjY1ODFDMCAxMC45ODYzIDAgNy41IDAgNy41QzAgNy41IDAgNC4wMTM3IDAuNDE4MiAyLjM0MTlDMC42NDc3IDEuNDIwMiAxLjMyNjEgMC42OTQ0IDIuMTg2NCAwLjQ0NzZDMy43NDU1IDAgMTAgMCAxMCAwQzEwIDAgMTYuMjU0NSAwIDE3LjgxMzYgMC40NDc2Wk0xMyA3LjVMOCAxMFY1TDEzIDcuNVoiIGZpbGw9IiM4RTlFQUIiLz4KPC9zdmc+Cg==" alt="YouTube logo" className="h-6 w-6 transition-opacity hover:opacity-75" />
                            </a>
                            <a href="https://m.blog.naver.com/daconist?tab=1" target="_blank" rel="noopener noreferrer" aria-label="Dacon Blog">
                                <img src="https://dacon.io/_nuxt/img/footer_blog.b618b8d.svg" alt="Blog logo" className="h-6 w-6 transition-opacity hover:opacity-75" />
                            </a>
                        </div>
                        
                        {/* Company Info */}
                        <div className={`border-t ${borderColor} md:border-none pt-6 md:pt-0 w-full md:w-auto text-xs space-y-2 text-left md:text-right`}>
                            <p>데이콘(주) | 대표 김국진 | 699-81-01021</p>
                            <p>통신판매업 신고번호: 제 2021-서울영등포-1704호</p>
                            <p>직업정보제공사업 신고번호: J1204020250004</p>
                            <p>서울특별시 영등포구 은행로 3 익스콘벤처타워 901호</p>
                            <p>
                                이메일 <a href="mailto:dacon@dacon.io" className={emailLinkClasses}>dacon@dacon.io</a> | 전화번호: 070-4102-0545
                            </p>
                            <p className="pt-2">
                                Copyright ⓒ DACON Inc. All rights reserved
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;