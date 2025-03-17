/**
 * ملف تهيئة bolt.diy
 * يقوم بتطبيق النمط العربي وإعداد التواصل بين bolt.diy وتطبيق Next.js
 */

(function() {
  // إضافة نمط CSS للتعريب
  function addStylesheet() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/bolt-theme.css';
    document.head.appendChild(link);
  }

  // تطبيق الاتجاه من اليمين إلى اليسار والنمط العربي
  function applyRtlAndTheme() {
    document.documentElement.classList.add('bolt-rtl', 'bolt-theme-nuqta');
    document.body.setAttribute('dir', 'rtl');
  }

  // تعريب واجهة المستخدم
  function arabizeUI() {
    // قائمة الترجمات
    const translations = {
      'Start new chat': 'بدء محادثة جديدة',
      'Search chats...': 'البحث في المحادثات...',
      'Your Chats': 'محادثاتك',
      'Guest User': 'مستخدم زائر',
      'Settings': 'الإعدادات',
      'Appearance': 'المظهر',
      'Language': 'اللغة',
      'Model': 'النموذج',
      'Provider': 'المزود',
      'Save': 'حفظ',
      'Cancel': 'إلغاء',
      'Delete': 'حذف',
      'Edit': 'تعديل',
      'Share': 'مشاركة',
      'Export': 'تصدير',
      'Import': 'استيراد',
      'Light': 'فاتح',
      'Dark': 'داكن',
      'System': 'النظام',
      'Send': 'إرسال',
      'Type a message...': 'اكتب رسالة...',
      'Regenerate': 'إعادة الإنشاء',
      'Stop generating': 'إيقاف الإنشاء',
      'Clear chat': 'مسح المحادثة',
      'New chat': 'محادثة جديدة',
      'Talk with Bolt, an AI assistant from StackBlitz': 'تحدث مع بولت، مساعد الذكاء الاصطناعي من نقطة',
      'Bolt': 'بولت',
    };

    // تعريب النصوص
    function translateText() {
      const textNodes = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while (node = textNodes.nextNode()) {
        const text = node.nodeValue.trim();
        if (text && translations[text]) {
          node.nodeValue = node.nodeValue.replace(text, translations[text]);
        }
      }

      // تعريب العناصر مع السمات
      document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
        if (translations[el.placeholder]) {
          el.placeholder = translations[el.placeholder];
        }
      });

      document.querySelectorAll('[title]').forEach(el => {
        if (translations[el.title]) {
          el.title = translations[el.title];
        }
      });

      document.querySelectorAll('[aria-label]').forEach(el => {
        if (translations[el.getAttribute('aria-label')]) {
          el.setAttribute('aria-label', translations[el.getAttribute('aria-label')]);
        }
      });
    }

    // تطبيق الترجمة بعد تحميل الصفحة وبعد كل تغيير في DOM
    translateText();

    // مراقبة التغييرات في DOM
    const observer = new MutationObserver(mutations => {
      translateText();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // إعداد التواصل مع تطبيق Next.js
  function setupCommunication() {
    window.addEventListener('message', event => {
      // التحقق من مصدر الرسالة
      if (event.origin !== window.location.origin) return;

      const { type, prompt, projectId } = event.data;

      switch (type) {
        case 'GENERATE_WEBSITE':
          // إرسال الوصف إلى bolt.diy
          if (window.boltChat && typeof window.boltChat.sendMessage === 'function') {
            window.boltChat.sendMessage(
              `أنشئ موقع ويب استنادًا إلى الوصف التالي: ${prompt}`
            );
            
            // إخطار التطبيق الأصلي بأن العملية بدأت
            window.parent.postMessage({
              type: 'GENERATION_STARTED',
              projectId
            }, window.location.origin);
          } else {
            console.error('boltChat غير متاح أو sendMessage ليست دالة');
            
            // إخطار التطبيق الأصلي بوجود خطأ
            window.parent.postMessage({
              type: 'GENERATION_ERROR',
              error: 'boltChat غير متاح'
            }, window.location.origin);
          }
          break;

        case 'SAVE_PROJECT':
          // حفظ المشروع
          if (window.boltChat && typeof window.boltChat.exportChat === 'function') {
            try {
              const projectData = window.boltChat.exportChat();
              
              // إرسال البيانات إلى تطبيق Next.js
              window.parent.postMessage({
                type: 'SAVE_PROJECT_DATA',
                projectData,
                projectId
              }, window.location.origin);
            } catch (error) {
              console.error('خطأ في تصدير المحادثة:', error);
              
              // إخطار التطبيق الأصلي بوجود خطأ
              window.parent.postMessage({
                type: 'SAVE_PROJECT_ERROR',
                error: error.message || 'خطأ في تصدير المحادثة'
              }, window.location.origin);
            }
          } else {
            console.error('boltChat غير متاح أو exportChat ليست دالة');
            
            // إخطار التطبيق الأصلي بوجود خطأ
            window.parent.postMessage({
              type: 'SAVE_PROJECT_ERROR',
              error: 'boltChat غير متاح'
            }, window.location.origin);
          }
          break;

        case 'LOAD_PROJECT':
          // تحميل مشروع
          if (window.boltChat && typeof window.boltChat.importChat === 'function' && event.data.projectData) {
            try {
              window.boltChat.importChat(
                event.data.projectData.description || 'مشروع موقع',
                event.data.projectData.messages || []
              );
              
              // إخطار التطبيق الأصلي بأن التحميل تم بنجاح
              window.parent.postMessage({
                type: 'LOAD_PROJECT_SUCCESS',
                projectId
              }, window.location.origin);
            } catch (error) {
              console.error('خطأ في استيراد المحادثة:', error);
              
              // إخطار التطبيق الأصلي بوجود خطأ
              window.parent.postMessage({
                type: 'LOAD_PROJECT_ERROR',
                error: error.message || 'خطأ في استيراد المحادثة'
              }, window.location.origin);
            }
          } else {
            console.error('boltChat غير متاح أو importChat ليست دالة أو بيانات المشروع غير متوفرة');
            
            // إخطار التطبيق الأصلي بوجود خطأ
            window.parent.postMessage({
              type: 'LOAD_PROJECT_ERROR',
              error: 'boltChat غير متاح أو بيانات المشروع غير متوفرة'
            }, window.location.origin);
          }
          break;
      }
    });

    // إخطار التطبيق الأصلي بأن bolt.diy جاهز
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.parent.postMessage({
          type: 'BOLT_READY'
        }, window.location.origin);
      }, 1000);
    });
  }

  // تعديل سلوك bolt.diy
  function modifyBoltBehavior() {
    // تخزين الإشارة الأصلية إلى sendMessage
    const originalSendMessage = window.boltChat?.sendMessage;

    // إعادة تعريف sendMessage لإضافة سلوك مخصص
    if (originalSendMessage) {
      window.boltChat.sendMessage = function(message) {
        // إضافة سياق إضافي للرسالة
        const enhancedMessage = message + '\n\nيرجى تقديم الرد باللغة العربية.';
        
        // استدعاء الدالة الأصلية
        originalSendMessage.call(window.boltChat, enhancedMessage);
        
        // إخطار التطبيق الأصلي
        window.parent.postMessage({
          type: 'MESSAGE_SENT',
          message
        }, window.location.origin);
      };
    }

    // تعديل سلوك الاستجابة
    document.addEventListener('ai-response', event => {
      // إخطار التطبيق الأصلي عند اكتمال الاستجابة
      window.parent.postMessage({
        type: 'GENERATION_COMPLETE',
        response: event.detail
      }, window.location.origin);
    });
  }

  // تنفيذ التهيئة
  function init() {
    addStylesheet();
    applyRtlAndTheme();
    
    // انتظار تحميل DOM
    document.addEventListener('DOMContentLoaded', () => {
      arabizeUI();
      setupCommunication();
      
      // انتظار تهيئة bolt.diy
      const checkBoltInterval = setInterval(() => {
        if (window.boltChat) {
          modifyBoltBehavior();
          clearInterval(checkBoltInterval);
          
          // إخطار التطبيق الأصلي بأن bolt.diy جاهز
          window.parent.postMessage({
            type: 'BOLT_READY'
          }, window.location.origin);
        }
      }, 500);
    });
  }

  // بدء التهيئة
  init();
})(); 