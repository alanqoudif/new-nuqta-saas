"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gray-900 py-20">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                سياسة ملفات تعريف الارتباط
              </h1>
              <p className="text-xl text-gray-300">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="bg-gray-950 py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-800">
              <div className="prose prose-lg prose-invert max-w-none">
                <h2>ما هي ملفات تعريف الارتباط؟</h2>
                <p>
                  ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهاز الكمبيوتر أو الجهاز المحمول الخاص بك عندما تزور موقعًا على الإنترنت. تُستخدم ملفات تعريف الارتباط على نطاق واسع لتشغيل مواقع الويب أو جعلها تعمل بشكل أكثر كفاءة، وكذلك لتوفير معلومات لمالكي الموقع.
                </p>

                <h2>كيف نستخدم ملفات تعريف الارتباط</h2>
                <p>
                  نستخدم ملفات تعريف الارتباط لعدة أسباب موضحة أدناه. لسوء الحظ، في معظم الحالات، لا توجد خيارات قياسية في الصناعة لتعطيل ملفات تعريف الارتباط دون تعطيل الوظائف والميزات التي تضيفها إلى الموقع. من المستحسن أن تترك جميع ملفات تعريف الارتباط إذا لم تكن متأكدًا مما إذا كنت بحاجة إليها أم لا، في حالة استخدامها لتوفير خدمة تستخدمها.
                </p>

                <h2>أنواع ملفات تعريف الارتباط التي نستخدمها</h2>
                
                <h3>ملفات تعريف الارتباط الضرورية</h3>
                <p>
                  هذه ملفات تعريف الارتباط المطلوبة لتمكين الوظائف الأساسية للموقع، مثل تسجيل الدخول الآمن وحفظ تفضيلاتك. لا يمكن تعطيل هذه الملفات في أنظمتنا.
                </p>

                <h3>ملفات تعريف الارتباط التحليلية</h3>
                <p>
                  تساعدنا هذه الملفات على جمع معلومات حول كيفية استخدام الزوار لموقعنا، مثل الصفحات التي يزورونها في كثير من الأحيان، وما إذا كانوا يواجهون أي أخطاء. تساعدنا هذه البيانات على تحسين أداء موقعنا.
                </p>

                <h3>ملفات تعريف الارتباط الوظيفية</h3>
                <p>
                  تسمح لنا هذه الملفات بتذكر الخيارات التي تقوم بها (مثل اسم المستخدم واللغة) وتوفير ميزات محسنة وأكثر شخصية.
                </p>

                <h3>ملفات تعريف الارتباط للإعلانات</h3>
                <p>
                  قد نستخدم ملفات تعريف الارتباط هذه لتقديم إعلانات أكثر صلة باهتماماتك. قد تُستخدم أيضًا لتحديد عدد المرات التي ترى فيها إعلانًا معينًا ولقياس فعالية الحملات الإعلانية.
                </p>

                <h2>ملفات تعريف الارتباط من جهات خارجية</h2>
                <p>
                  في بعض الحالات الخاصة، نستخدم أيضًا ملفات تعريف الارتباط التي يوفرها أطراف ثالثة موثوق بها. يوضح القسم التالي ملفات تعريف الارتباط من جهات خارجية التي قد تواجهها من خلال هذا الموقع.
                </p>
                <ul>
                  <li>يستخدم هذا الموقع Google Analytics، وهي واحدة من أكثر حلول التحليلات انتشارًا وثقة على الويب، لمساعدتنا على فهم كيفية استخدامك للموقع وطرق تحسين تجربتك.</li>
                  <li>من وقت لآخر، نختبر ميزات جديدة ونجري تغييرات طفيفة على طريقة تقديم الموقع. عندما نختبر ميزات جديدة، قد يتم استخدام ملفات تعريف الارتباط هذه للتأكد من حصولك على تجربة متسقة أثناء وجودك على الموقع.</li>
                </ul>

                <h2>كيفية التحكم في ملفات تعريف الارتباط</h2>
                <p>
                  يمكنك منع تعيين ملفات تعريف الارتباط عن طريق ضبط الإعدادات في متصفحك (راجع مساعدة المتصفح لمعرفة كيفية القيام بذلك). ضع في اعتبارك أن تعطيل ملفات تعريف الارتباط سيؤثر على وظائف هذا وغيره من المواقع التي تزورها.
                </p>
                <p>
                  لذلك يوصى بعدم تعطيل ملفات تعريف الارتباط.
                </p>

                <h2>مزيد من المعلومات</h2>
                <p>
                  نأمل أن يكون ذلك قد أوضح الأمور بالنسبة لك. كما ذكرنا سابقًا، إذا لم تكن متأكدًا مما إذا كنت بحاجة إلى شيء ما أم لا، فمن الأفضل عادةً ترك ملفات تعريف الارتباط ممكّنة في حالة تفاعلها مع إحدى الميزات التي تستخدمها على موقعنا.
                </p>
                <p>
                  إذا كنت لا تزال تبحث عن مزيد من المعلومات، يمكنك الاتصال بنا من خلال:
                </p>
                <ul>
                  <li>البريد الإلكتروني: info@nuqtai.com</li>
                  <li>الهاتف: +968 77442969</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 