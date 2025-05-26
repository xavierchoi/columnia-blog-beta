source "https://rubygems.org"

group :jekyll_plugins do
  gem "github-pages"
  # Ruby 3.4 호환성을 위한 필수 gem들
  gem "csv"
  gem "logger"
  gem "ostruct"
  gem "base64"
  # Jekyll 플러그인들
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-seo-tag", "~> 2.8"
  gem "jekyll-paginate-v2", "~> 3.0"
end

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", platforms: [:mingw, :x64_mingw, :mswin]
gem "http_parser.rb", "~> 0.6.0", platforms: [:jruby]

# 개발용 유틸리티
gem "webrick", "~> 1.8"
