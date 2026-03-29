
## No 1
增加页面设计，用户反馈启动页面
页面包含输入邮箱 和 匿名反馈（需要提示匿名反馈处理会略慢一些），
输入邮箱后需要验证邮箱页面

请增加对应的页面输出高保真的原型图，请通过以下方式帮我完成所有界面的原型设计，并确保这些原型界面可以直接用于开发：
1、用户体验分析：先分析这几个页面的主要功能和用户需求，确定核心交互逻辑。
2、产品界面规划：作为产品经理，结合之前分类信息定义关键界面，确保信息架构合理。
3、高保真 UI 设计：作为 UI 设计师，设计贴近真实 iOS/Android 设计规范的界面，使用现代化的 UI 元素，使其具有良好的视觉体验。
4、HTML 原型实现：使用 HTML + Tailwind CSS（或 Bootstrap）生成所有原型界面，并使用 FontAwesome（或其他开源 UI 组件）让界面更加精美、接近真实的 App 设计。
拆分代码文件，保持结构清晰：
5、每个界面应作为独立的 HTML 文件存放，例如 home.html、profile.html、settings.html 等。

index.html 作为主入口，不直接写入所有界面的 HTML 代码，而是使用 iframe 的方式嵌入这些 HTML 片段，并将所有页面直接平铺展示在已经存在的 index 页面中，而不是跳转链接。
真实感增强：
界面尺寸应模拟 iPhone 15 Pro，并让界面圆角化，使其更像真实的手机界面。
使用真实的 UI 图片，而非占位符图片（可从 Unsplash、Pexels、Apple 官方 UI 资源中选择）。
添加顶部状态栏（模拟 iOS 状态栏），并包含 App 导航栏（类似 iOS 底部 Tab Bar）
输出文件放到ui目录中

## No 2

增加用户反馈启动页和 邮箱验证码验证页的编码处理 后端逻辑对接的部分先暂时不处理 只关注ui部分
这里增加路由 用于编码 反馈启动页面的ui
好的 请继续把“邮箱验证码页”也接成真实 React 路由（例如 /feedback/verify），并把当前启动页按钮跳转改到该页面
使用state传递，不要把邮箱暴露在url中 

## No 3
增加后端api endpoint到 .env中用于前端请求
增加 FEEDBACK API BASE URL

增加我的反馈列表页面的ui，先完成ui部分，后续的接口等后端完成再对接，ui部分的数据可以先用mock data

## No 4

[
        {
            "id": "0116a5d5-3ab5-4d9b-8fac-2ac3900321a7",
            "feedbackId": "36fd8b8e-0658-4537-a031-44c9ab4eae9f",
            "sender": "customer",
            "senderId": "user123",
            "content": "页面有报错",
            "isQuestion": true,
            "inReplyToMessageId": null,
            "createdAt": "2026-03-28T20:50:52.602Z",
            "attachments": []
        },
        {
            "id": "b248eeff-c15c-4819-b0a0-3c28315f8057",
            "feedbackId": "36fd8b8e-0658-4537-a031-44c9ab4eae9f",
            "sender": "admin",
            "senderId": "admin01",
            "content": "已收到，我们在排查",
            "isQuestion": false,
            "inReplyToMessageId": "0116a5d5-3ab5-4d9b-8fac-2ac3900321a7",
            "createdAt": "2026-03-28T21:00:34.025Z",
            "attachments": []
        },
        {
            "id": "a6379576-31ff-4134-9df8-fb0667ba5efc",
            "feedbackId": "36fd8b8e-0658-4537-a031-44c9ab4eae9f",
            "sender": "customer",
            "senderId": "user123",
            "content": "请问大概多久修复？",
            "isQuestion": true,
            "inReplyToMessageId": null,
            "createdAt": "2026-03-28T21:03:02.628Z",
            "attachments": []
        }
    ]