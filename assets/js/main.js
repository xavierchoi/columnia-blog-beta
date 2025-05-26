// Theme Management (localStorage 제거하고 sessionStorage 사용)
let currentTheme = 'light';

function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    currentTheme = newTheme;
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // sessionStorage 대신 메모리에 저장 (페이지 새로고침 시 초기화됨)
    try {
        sessionStorage.setItem('theme', newTheme);
    } catch (e) {
        // sessionStorage 실패 시 무시
        console.log('SessionStorage not available');
    }
}

// Language Dropdown
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const languageSwitcher = document.querySelector('.language-switcher');
    const dropdown = document.getElementById('languageDropdown');
    
    if (languageSwitcher && dropdown && !languageSwitcher.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Reading Progress Bar (통합된 버전)
function updateReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 더 정확한 계산
    const maxScrollTop = documentHeight - windowHeight;
    const progress = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * 100 : 0;
    
    progressBar.style.width = Math.max(0, Math.min(100, progress)) + '%';
}

// Back to Top Button
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function toggleBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

// Calculate reading time
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
}

// Initialize reading time for all posts
function initReadingTime() {
    // 포스트 카드들의 읽기 시간 계산
    document.querySelectorAll('.post-card').forEach(post => {
        const excerpt = post.querySelector('.post-excerpt');
        const title = post.querySelector('.post-title a');
        const readingTimeElement = post.querySelector('.reading-time');
        
        if (excerpt && title && readingTimeElement) {
            const fullText = title.textContent + ' ' + excerpt.textContent;
            const readingTime = calculateReadingTime(fullText);
            readingTimeElement.innerHTML = `📖 ${readingTime} min read`;
        }
    });
    
    // 단일 포스트 페이지의 읽기 시간 계산
    const postContent = document.querySelector('.post-content');
    const singleReadingTime = document.querySelector('.post-single .reading-time');
    
    if (postContent && singleReadingTime) {
        const readingTime = calculateReadingTime(postContent.textContent);
        singleReadingTime.innerHTML = `📖 ${readingTime} min read`;
    }
}

// ============================================================================
// 향상된 전역 검색 시스템
// ============================================================================

// 전역 검색 데이터 저장
let searchData = null;

// 검색 초기화 (완전히 새로운 버전)
function initSearch() {
    // 헤더 검색 바 처리
    initHeaderSearch();
    
    // 홈페이지 실시간 검색 처리 (기존 기능 유지)
    initHomePageSearch();
    
    // 검색 페이지 처리
    initSearchPage();
}

// 헤더 검색 바 (모든 페이지에서 작동)
function initHeaderSearch() {
    const headerSearchInput = document.getElementById('searchInput');
    if (!headerSearchInput) return;
    
    // Enter 키 이벤트
    headerSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = this.value.trim();
            if (query) {
                // 검색 페이지로 이동
                window.location.href = `/search/?q=${encodeURIComponent(query)}`;
            }
        }
    });
    
    // 검색 아이콘 클릭 시에도 검색 실행
    const searchIcon = document.querySelector('.header-search .search-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', function() {
            const query = headerSearchInput.value.trim();
            if (query) {
                window.location.href = `/search/?q=${encodeURIComponent(query)}`;
            } else {
                // 검색어가 없으면 검색 페이지로 이동
                window.location.href = '/search/';
            }
        });
        
        // 검색 아이콘을 클릭 가능하게 만들기
        searchIcon.style.cursor = 'pointer';
        searchIcon.style.pointerEvents = 'auto';
    }
}

// 홈페이지 실시간 검색 (기존 기능 유지)
function initHomePageSearch() {
    // 홈페이지에서만 실행
    if (!document.querySelector('.posts-grid')) return;
    
    const searchInput = document.getElementById('searchInput');
    const posts = document.querySelectorAll('.post-card');
    
    if (!searchInput || posts.length === 0) return;
    
    const noResultsMessage = createNoResultsMessage();
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        let visibleCount = 0;
        
        posts.forEach(post => {
            const titleElement = post.querySelector('.post-title a');
            const excerptElement = post.querySelector('.post-excerpt');
            const categoryElement = post.querySelector('.post-category');
            const tagElements = post.querySelectorAll('.post-tag');
            
            if (!titleElement || !excerptElement) return;
            
            const title = titleElement.textContent.toLowerCase();
            const excerpt = excerptElement.textContent.toLowerCase();
            const category = categoryElement ? categoryElement.textContent.toLowerCase() : '';
            const tags = Array.from(tagElements).map(tag => tag.textContent.toLowerCase()).join(' ');
            
            const isMatch = searchTerm === '' || 
                          title.includes(searchTerm) || 
                          excerpt.includes(searchTerm) ||
                          category.includes(searchTerm) ||
                          tags.includes(searchTerm);
            
            if (isMatch) {
                post.style.display = 'block';
                post.classList.add('fade-in');
                visibleCount++;
            } else {
                post.style.display = 'none';
                post.classList.remove('fade-in');
            }
        });
        
        toggleNoResultsMessage(visibleCount === 0 && searchTerm !== '', noResultsMessage);
    });
}

// 검색 페이지 초기화
function initSearchPage() {
    // 검색 페이지가 아니면 종료
    if (!document.querySelector('.search-page')) return;
    
    // 검색 데이터 로드
    loadSearchData();
    
    // URL에서 검색어 추출
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';
    
    const searchInput = document.getElementById('searchQuery');
    const searchButton = document.getElementById('searchButton');
    
    if (!searchInput) return;
    
    // 초기 검색어 설정
    if (initialQuery) {
        searchInput.value = initialQuery;
        performSearch(initialQuery);
    }
    
    // 검색 이벤트 리스너
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = this.value.trim();
            performSearch(query);
            updateURL(query);
        }
    });
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const query = searchInput.value.trim();
            performSearch(query);
            updateURL(query);
        });
    }
    
    // 검색 입력 필드에 포커스
    searchInput.focus();
}

// 검색 데이터 로드
function loadSearchData() {
    const searchDataElement = document.getElementById('search-data');
    if (searchDataElement) {
        try {
            searchData = JSON.parse(searchDataElement.textContent);
        } catch (e) {
            console.error('검색 데이터 로드 실패:', e);
            searchData = { posts: [] };
        }
    }
}

// 검색 실행
function performSearch(query) {
    const resultsContainer = document.getElementById('searchResultsList');
    const statusContainer = document.getElementById('searchStatus');
    const popularCategories = document.getElementById('popularCategories');
    const recentPosts = document.getElementById('recentPostsSection');
    
    if (!resultsContainer || !statusContainer) return;
    
    // 검색어가 없으면 초기 상태로
    if (!query) {
        statusContainer.innerHTML = '<p>검색어를 입력하고 Enter 키를 누르거나 검색 버튼을 클릭하세요.</p>';
        resultsContainer.innerHTML = '';
        if (popularCategories) popularCategories.style.display = 'block';
        if (recentPosts) recentPosts.style.display = 'block';
        return;
    }
    
    // 인기 카테고리와 최근 포스트 숨기기
    if (popularCategories) popularCategories.style.display = 'none';
    if (recentPosts) recentPosts.style.display = 'none';
    
    // 로딩 상태
    statusContainer.innerHTML = '<p>🔍 검색 중...</p>';
    resultsContainer.innerHTML = '';
    
    // 검색 실행
    setTimeout(() => {
        const results = searchPosts(query);
        displaySearchResults(results, query);
    }, 100); // 약간의 지연으로 로딩 상태 표시
}

// 포스트 검색
function searchPosts(query) {
    if (!searchData || !searchData.posts) return [];
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return searchData.posts.filter(post => {
        const searchableText = [
            post.title,
            post.excerpt,
            post.category,
            ...(post.tags || []),
            post.content.substring(0, 500) // 내용의 일부만 검색
        ].join(' ').toLowerCase();
        
        // 모든 검색어가 포함되어야 함 (AND 검색)
        return searchTerms.every(term => searchableText.includes(term));
    }).map(post => {
        // 검색 점수 계산 (제목 > 카테고리 > 태그 > 내용 순으로 가중치)
        let score = 0;
        const titleMatch = searchTerms.filter(term => post.title.toLowerCase().includes(term)).length;
        const categoryMatch = searchTerms.filter(term => post.category.toLowerCase().includes(term)).length;
        const tagMatch = searchTerms.filter(term => (post.tags || []).some(tag => tag.toLowerCase().includes(term))).length;
        const contentMatch = searchTerms.filter(term => post.excerpt.toLowerCase().includes(term)).length;
        
        score = titleMatch * 10 + categoryMatch * 5 + tagMatch * 3 + contentMatch * 1;
        
        return { ...post, score };
    }).sort((a, b) => b.score - a.score); // 점수순 정렬
}

// 검색 결과 표시
function displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('searchResultsList');
    const statusContainer = document.getElementById('searchStatus');
    
    if (!resultsContainer || !statusContainer) return;
    
    // 상태 메시지 업데이트
    if (results.length > 0) {
        statusContainer.innerHTML = `<p><strong>"${query}"</strong>에 대한 검색 결과 <strong>${results.length}개</strong></p>`;
    } else {
        statusContainer.innerHTML = `<p><strong>"${query}"</strong>에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.</p>`;
        resultsContainer.innerHTML = `
            <div class="no-search-results">
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3>검색 결과가 없습니다</h3>
                    <p>다른 키워드로 검색해보세요.</p>
                    <div style="margin-top: 1.5rem;">
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">
                            <strong>검색 팁:</strong><br>
                            • 더 간단한 키워드를 사용해보세요<br>
                            • 띄어쓰기를 확인해보세요<br>
                            • 카테고리 이름으로 검색해보세요
                        </p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // 검색 결과 렌더링
    const resultsHTML = results.map(post => {
        const excerpt = highlightSearchTerms(post.excerpt, query);
        const title = highlightSearchTerms(post.title, query);
        
        return `
            <article class="search-result-item">
                <div class="search-result-meta">
                    <span class="search-result-category">${post.category}</span>
                    <span class="search-result-date">${formatDate(post.date)}</span>
                </div>
                <h3 class="search-result-title">
                    <a href="${post.url}">${title}</a>
                </h3>
                <p class="search-result-excerpt">${excerpt}</p>
                ${post.tags && post.tags.length > 0 ? `
                <div class="search-result-tags">
                    ${post.tags.map(tag => `<span class="search-result-tag">${tag}</span>`).join('')}
                </div>
                ` : ''}
            </article>
        `;
    }).join('');
    
    resultsContainer.innerHTML = resultsHTML;
    
    // 결과에 애니메이션 적용
    resultsContainer.querySelectorAll('.search-result-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
    });
}

// 검색어 하이라이팅
function highlightSearchTerms(text, query) {
    if (!query) return text;
    
    const terms = query.split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    terms.forEach(term => {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
}

// 정규식 이스케이프
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// URL 업데이트 (검색어 포함)
function updateURL(query) {
    const url = new URL(window.location);
    if (query) {
        url.searchParams.set('q', query);
    } else {
        url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);
}

// ============================================================================
// 기존 함수들
// ============================================================================

function createNoResultsMessage() {
    const message = document.createElement('div');
    message.className = 'no-search-results';
    message.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 키워드로 검색해보세요.</p>
        </div>
    `;
    message.style.display = 'none';
    
    const postsContainer = document.querySelector('.posts-grid') || document.querySelector('.main-content');
    if (postsContainer) {
        postsContainer.appendChild(message);
    }
    
    return message;
}

function toggleNoResultsMessage(show, messageElement) {
    if (messageElement) {
        messageElement.style.display = show ? 'block' : 'none';
    }
}

// Enhanced scroll animations
function initScrollAnimations() {
    if (!window.IntersectionObserver) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); // 한 번만 애니메이션
            }
        });
    }, observerOptions);
    
    // 관찰할 요소들
    const elementsToAnimate = [
        ...document.querySelectorAll('.post-card'),
        ...document.querySelectorAll('.sidebar-section'),
        ...document.querySelectorAll('.category-card')
    ];
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Enhanced Share functionality
function sharePost(platform, url, title) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    let shareUrl = '';
    
    switch(platform.toLowerCase()) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
        case 'twitter':
        case 'x':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
        case 'kakao':
        case 'kakaotalk':
            // 실제 구현 시에는 Kakao SDK 필요
            showNotification('카카오톡 공유 기능은 실제 구현 시 Kakao SDK가 필요합니다.', 'info');
            return;
        default:
            console.warn('Unknown sharing platform:', platform);
            return;
    }
    
    if (shareUrl) {
        const shareWindow = window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        
        // 공유 완료 피드백
        if (shareWindow) {
            showNotification('공유 창이 열렸습니다!', 'success');
        }
    }
}

function initShareButtons() {
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.getAttribute('data-platform') || 
                           this.getAttribute('title')?.toLowerCase() || 
                           this.textContent.trim();
            const url = this.getAttribute('data-url') || window.location.href;
            const title = this.getAttribute('data-title') || document.title;
            
            // 포스트 카드에서 제목 추출
            const postCard = this.closest('.post-card');
            const postPage = this.closest('.post-single');
            
            let finalTitle = title;
            if (postCard) {
                const postTitleElement = postCard.querySelector('.post-title a');
                finalTitle = postTitleElement ? postTitleElement.textContent : title;
            } else if (postPage) {
                const postTitleElement = postPage.querySelector('.post-title');
                finalTitle = postTitleElement ? postTitleElement.textContent : title;
            }
            
            sharePost(platform, url, finalTitle);
        });
    });
}

// Mobile menu functionality (개선된 버전)
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (!mobileMenuToggle) return;
    
    // 모바일 메뉴 생성 (숨겨진 네비게이션이 있을 경우)
    let mobileMenu = document.querySelector('.mobile-nav-menu');
    
    if (!mobileMenu) {
        // 모바일 메뉴가 없으면 생성
        mobileMenu = createMobileMenu();
    }
    
    if (!mobileMenu) return;
    
    mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = mobileMenu.classList.contains('show');
        
        if (isOpen) {
            closeMobileMenu(mobileMenu, mobileMenuToggle);
        } else {
            openMobileMenu(mobileMenu, mobileMenuToggle);
        }
    });
    
    // 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', function(event) {
        if (!mobileMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            closeMobileMenu(mobileMenu, mobileMenuToggle);
        }
    });
    
    // 메뉴 링크 클릭 시 닫기
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu(mobileMenu, mobileMenuToggle);
        });
    });
}

function createMobileMenu() {
    const menu = document.createElement('div');
    menu.className = 'mobile-nav-menu';
    menu.innerHTML = `
        <nav class="mobile-nav">
            <a href="/" class="mobile-nav-link">홈</a>
            <a href="/categories" class="mobile-nav-link">카테고리</a>
            <a href="/tags" class="mobile-nav-link">태그</a>
            <a href="/about" class="mobile-nav-link">소개</a>
            <a href="/contact" class="mobile-nav-link">연락처</a>
        </nav>
    `;
    
    document.body.appendChild(menu);
    return menu;
}

function openMobileMenu(menu, toggle) {
    menu.classList.add('show');
    toggle.innerHTML = '✕';
    document.body.style.overflow = 'hidden'; // 스크롤 방지
}

function closeMobileMenu(menu, toggle) {
    menu.classList.remove('show');
    toggle.innerHTML = '☰';
    document.body.style.overflow = ''; // 스크롤 복원
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-primary);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = 'var(--accent-secondary)';
    } else if (type === 'error') {
        notification.style.background = '#ef4444';
    }
    
    document.body.appendChild(notification);
    
    // 애니메이션
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 자동 제거
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (!images.length || !window.IntersectionObserver) {
        // 폴백: 즉시 로드
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
        return;
    }
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.remove('lazy');
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px' // 이미지가 뷰포트에 가까워지면 미리 로드
    });
    
    images.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced Code block copy functionality
function initCodeCopy() {
    document.querySelectorAll('pre code').forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        if (pre.querySelector('.code-copy-btn')) return; // 이미 버튼이 있으면 건너뛰기
        
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.innerHTML = '<span>📋</span> 복사';
        
        copyButton.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: var(--accent-primary);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            opacity: 0.8;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 4px;
            z-index: 10;
        `;
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
        
        copyButton.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(codeBlock.textContent);
                this.innerHTML = '<span>✅</span> 복사됨!';
                this.style.background = 'var(--accent-secondary)';
                
                setTimeout(() => {
                    this.innerHTML = '<span>📋</span> 복사';
                    this.style.background = 'var(--accent-primary)';
                }, 2000);
                
                showNotification('코드가 클립보드에 복사되었습니다!', 'success');
            } catch (err) {
                console.error('Failed to copy code: ', err);
                showNotification('코드 복사에 실패했습니다.', 'error');
                
                // 폴백: 텍스트 선택
                selectText(codeBlock);
            }
        });
        
        copyButton.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1.05)';
        });
        
        copyButton.addEventListener('mouseleave', function() {
            this.style.opacity = '0.8';
            this.style.transform = 'scale(1)';
        });
    });
}

// 텍스트 선택 폴백 함수
function selectText(element) {
    if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// ============================================================================
// 목차 디버깅 및 생성 (수정된 버전)
// ============================================================================

function initTableOfContents() {
    console.log('🔍 목차 초기화 시작');
    
    const postContent = document.querySelector('.post-content');
    const tocContainer = document.querySelector('.table-of-contents');
    
    console.log('포스트 내용:', postContent);
    console.log('목차 컨테이너:', tocContainer);
    
    if (!postContent) {
        console.log('❌ .post-content를 찾을 수 없음');
        return;
    }
    
    if (!tocContainer) {
        console.log('❌ .table-of-contents를 찾을 수 없음');
        return;
    }
    
    // 모든 헤딩 찾기
    const allHeadings = postContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const h2h3Headings = postContent.querySelectorAll('h2, h3');
    
    console.log('전체 헤딩 개수:', allHeadings.length);
    console.log('H2, H3 헤딩 개수:', h2h3Headings.length);
    
    // 헤딩 목록 출력
    allHeadings.forEach((heading, index) => {
        console.log(`헤딩 ${index + 1}: ${heading.tagName} - "${heading.textContent}"`);
    });
    
    if (h2h3Headings.length < 1) {
        console.log('❌ H2, H3 헤딩이 충분하지 않음');
        
        // TOC 섹션 숨기기
        const tocSection = tocContainer.closest('.sidebar-section');
        if (tocSection) {
            tocSection.style.display = 'none';
            console.log('✅ TOC 섹션 숨김');
        }
        return;
    }
    
    console.log('✅ 목차 생성 시작');
    
    // 목차 생성
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    
    h2h3Headings.forEach((heading, index) => {
        // ID가 없으면 생성
        if (!heading.id) {
            const headingText = heading.textContent.toLowerCase()
                .replace(/[^\w\s-가-힣]/g, '') // 한글 포함, 특수문자 제거
                .replace(/\s+/g, '-') // 공백을 하이픈으로
                .trim();
            heading.id = headingText || `heading-${index}`;
            console.log(`ID 생성: ${heading.tagName} → ${heading.id}`);
        }
        
        const listItem = document.createElement('li');
        listItem.className = `toc-item toc-${heading.tagName.toLowerCase()}`;
        
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        link.className = 'toc-link';
        
        // 클릭 이벤트 추가
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`목차 클릭: ${heading.textContent}`);
            
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = heading.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
        
        console.log(`목차 항목 추가: ${heading.textContent}`);
    });
    
    // DOM에 추가
    tocContainer.innerHTML = '';
    tocContainer.appendChild(tocList);
    
    console.log('✅ 목차 생성 완료');
    
    // 스크롤 하이라이팅 초기화
    initTocHighlighting(h2h3Headings);
}

// 개선된 TOC 하이라이팅
function initTocHighlighting(headings) {
    if (!window.IntersectionObserver) {
        console.log('❌ IntersectionObserver 지원하지 않음');
        return;
    }
    
    console.log('✅ TOC 하이라이팅 초기화');
    
    const tocLinks = document.querySelectorAll('.toc-link');
    let currentActive = null;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            const tocLink = document.querySelector(`.toc-link[href="#${id}"]`);
            
            if (entry.isIntersecting) {
                if (currentActive) {
                    currentActive.classList.remove('active');
                }
                if (tocLink) {
                    tocLink.classList.add('active');
                    currentActive = tocLink;
                    console.log(`활성 목차: ${entry.target.textContent}`);
                }
            }
        });
    }, {
        rootMargin: '-10% 0px -80% 0px'
    });
    
    headings.forEach(heading => observer.observe(heading));
}

// Performance optimized scroll handler
function createScrollHandler() {
    let ticking = false;
    
    return function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateReadingProgress();
                toggleBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    };
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme (세션 스토리지에서)
    try {
        const savedTheme = sessionStorage.getItem('theme') || 'light';
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {
        // 실패 시 기본 테마 사용
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Initialize all features
    initReadingTime();
    initSearch();
    initScrollAnimations();
    initShareButtons();
    initMobileMenu();
    initLazyLoading();
    initSmoothScroll();
    initCodeCopy();
    initTableOfContents();
    
    // Add optimized scroll event listener
    const scrollHandler = createScrollHandler();
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // 초기 로드 완료 알림
    console.log('✅ 블로그 초기화 완료');
    
    // 페이지 구조 분석 (1초 후)
    setTimeout(() => {
        console.log('🔍 페이지 구조 분석:');
        
        // 사이드바 확인
        const sidebar = document.querySelector('.sidebar');
        console.log('사이드바:', sidebar);
        
        // TOC 섹션 확인
        const tocSection = document.querySelector('.sidebar-section');
        console.log('TOC 섹션:', tocSection);
        
        // 포스트 내용 확인
        const postContent = document.querySelector('.post-content');
        if (postContent) {
            console.log('포스트 내용 길이:', postContent.innerHTML.length);
            console.log('포스트 내용 미리보기:', postContent.innerHTML.substring(0, 200) + '...');
        }
        
    }, 1000);
});

// 창 크기 변경 시 처리
window.addEventListener('resize', function() {
    // 모바일 메뉴가 열려있으면 닫기
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && mobileMenu.classList.contains('show')) {
        closeMobileMenu(mobileMenu, mobileToggle);
    }
}, { passive: true });

// 조회수 카운터 임포트
document.head.appendChild(Object.assign(document.createElement('script'), {
    src: '/assets/js/view-counter.js'
}));

// 태그 클릭 이벤트 (전역)
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('tag-clickable')) {
            const tagName = e.target.getAttribute('data-tag');
            window.location.href = `/search/?q=${encodeURIComponent(tagName)}`;
        }
    });
});