import { NextResponse } from 'next/server'

// Embeddable Stock Widget Script
// Usage: <script src="https://lician.com/embed/widget.js" data-ticker="AAPL"></script>

const widgetScript = `
(function() {
  'use strict';

  var LICIAN_BASE = 'https://lician.com';

  function createWidget(container, ticker, options) {
    options = options || {};
    var theme = options.theme || 'light';
    var showChange = options.showChange !== false;
    var showVolume = options.showVolume !== false;

    // Create widget container
    var widget = document.createElement('div');
    widget.className = 'lician-stock-widget';
    widget.style.cssText = 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; border-radius: 8px; padding: 16px; min-width: 200px; ' +
      (theme === 'dark' ? 'background: #1a1a2e; color: #fff; border: 1px solid #333;' : 'background: #fff; color: #1a1a2e; border: 1px solid #e5e5e5; box-shadow: 0 2px 8px rgba(0,0,0,0.08);');

    // Loading state
    widget.innerHTML = '<div style="text-align: center; padding: 20px; opacity: 0.6;">Loading ' + ticker + '...</div>';
    container.appendChild(widget);

    // Fetch data
    fetch(LICIAN_BASE + '/api/embed/stock?ticker=' + encodeURIComponent(ticker))
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.error) {
          widget.innerHTML = '<div style="text-align: center; color: #e74c3c;">Ticker not found</div>';
          return;
        }

        var changeColor = (data.change >= 0) ? '#10b981' : '#ef4444';
        var changePrefix = (data.change >= 0) ? '+' : '';
        var changePercent = data.changePercent ? data.changePercent.toFixed(2) : '0.00';

        var html = '' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">' +
            '<div>' +
              '<div style="font-size: 18px; font-weight: 700;">' + data.ticker + '</div>' +
              '<div style="font-size: 12px; opacity: 0.7; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + (data.name || '') + '</div>' +
            '</div>' +
            '<div style="text-align: right;">' +
              '<div style="font-size: 20px; font-weight: 700;">$' + (data.price ? data.price.toFixed(2) : 'N/A') + '</div>' +
              (showChange ? '<div style="font-size: 13px; color: ' + changeColor + '; font-weight: 600;">' + changePrefix + changePercent + '%</div>' : '') +
            '</div>' +
          '</div>';

        if (showVolume && data.volume) {
          html += '<div style="font-size: 11px; opacity: 0.6; margin-bottom: 8px;">Vol: ' + formatNumber(data.volume) + '</div>';
        }

        // Attribution link (required - dofollow backlink!)
        html += '<a href="' + LICIAN_BASE + '/stock/' + data.ticker + '" target="_blank" rel="noopener" style="display: block; text-align: right; font-size: 10px; color: ' + (theme === 'dark' ? '#888' : '#666') + '; text-decoration: none; margin-top: 8px;">Powered by <span style="color: ' + (theme === 'dark' ? '#60a5fa' : '#3b82f6') + '; font-weight: 600;">Lician</span></a>';

        widget.innerHTML = html;
      })
      .catch(function(err) {
        widget.innerHTML = '<div style="text-align: center; color: #e74c3c;">Failed to load data</div>';
      });
  }

  function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  }

  // Auto-initialize widgets
  function init() {
    var scripts = document.querySelectorAll('script[data-ticker]');
    scripts.forEach(function(script) {
      if (script.getAttribute('data-lician-initialized')) return;
      script.setAttribute('data-lician-initialized', 'true');

      var container = document.createElement('div');
      script.parentNode.insertBefore(container, script);

      createWidget(container, script.getAttribute('data-ticker'), {
        theme: script.getAttribute('data-theme') || 'light',
        showChange: script.getAttribute('data-show-change') !== 'false',
        showVolume: script.getAttribute('data-show-volume') !== 'false'
      });
    });
  }

  // Also expose global API
  window.LicianWidget = {
    create: createWidget,
    init: init
  };

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`

export async function GET() {
  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
