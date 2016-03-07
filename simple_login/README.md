isnowfy.github.io
=================
最近发现静态博客很流行啊，一是因为博客这东西本来就没多少文章，用上数据库，后端啥的有点杀鸡用牛刀的感觉，二是静态页面天然的速度优势，于是现在很多人便纷纷开始用静态博客了。加之[github pages](https://pages.github.com/)可以很方便而且是免费的放置静态页面，于是便有了像jelly，octopress等一系列好用的静态博客生成程序。而且现在dropbox也支持放置静态页面，也有了像farbox等一类好用的工具。

当然很多程序员geek们当然不满足用很多现有的静态博客生成工具，为了显示高逼格，大家纷纷去搞自己的静态博客生成程序，于是我也加入了这一行列，搞了一个自己的。。。

当然啦，咱去搞的还是有点不同的，像很多静态博客生成程序都是需要跑程序来生成的，就像jelly，是用ruby写的，你需要跑这个东西才能生成自己的静态博客，于是我写的这个项目[simple](https://github.com/isnowfy/simple)就完全是在网页中像wordpress那样的cms一样使用，但是咱这个还是个静态页面，就是说，你可以在线的写blog，然后程序会自动在你的github pages下的项目生成静态文件。

并且咱这个blog就是用我的这个[simple](https://github.com/isnowfy/simple)生成的，markdown来书写，支持数学公式像$x^2=1$ ，还支持代码高亮。

~~~~{python}
print 'hello world'
~~~~

貌似说的还不是很清楚，那就详细描述说明一下好了。

* 首先你需要注册一个[GitHub](https://github.com)的帐号。

* 创建一个`username.github.io`的project，注意要勾选生成README。

![github](http://isnowfy.github.io/img/GitHub_Pages.png)

* 用github帐号登录[simple](https://github.com/isnowfy/simple).

* 点击`Initialize`来初始化blog，之后点击`Go`就可以开始写markdown的blog了。

![simple](http://isnowfy.github.io/img/Simple.png)

单击`New post`就可以新建文章来开始写作了，完成之后点击`Save`就可以生成静态页面了，之后访问你的username.github.io就可以看到生成的blog了！

注意github pages貌似有缓存，也就是说会有一段时间的延迟，可能不能立即看到效果，不过等几分钟就好啦。
