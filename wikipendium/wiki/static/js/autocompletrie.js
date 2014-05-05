(function($) {

    $.fn.autocompletrie = function(trie) {
        return this.each(function() {

            var suggestions = $('#suggestions');

            function search(trie, word){
                if(word.length == 0) {
                    reset();
                    return [];
                }
                word = word.toLowerCase();
                var ret = [];
                for(var i=0;i<trie.length;i++){
                    if(trie[i].label.toLowerCase().indexOf(word) !== -1){
                        ret.push(trie[i]);        
                    }
                }
                return ret;
            }

            function bindElements() {
                ul.children().on('mouseover', function(e){
                    index = $(this).attr('data-idx');
                    ul.children().removeClass('active');
                    $(ul.children()[index]).addClass("active");
                }).on('touchstart',function(e){
                    index = $(this).attr('data-idx');
                    ul.children().removeClass('active');
                    $(ul.children()[index]).addClass("active");
                }).on('touchmove',function(e){
                    index = $(this).attr('data-idx');
                    ul.children().removeClass('active');
                    $(ul.children()[index]).addClass("active");
                }).on('click touchend',function(e){
                    e.preventDefault();
                    index = $(this).attr('data-idx');
                    ul.children().removeClass('active');
                    $(ul.children()[index]).addClass("active");
                    var url = $(ul.children()[index]).attr('data-url') || sb.val();
                    window.location = url;
                    return false;
                });
                $(ul.children()[index]).addClass("active");
            }

            function reset() {
                ul.empty();
                for(var i = 0; i < trie.length; i++) {
                    var li = document.createElement("li");
                    li.textContent = trie[i].label;
                    li.setAttribute('data-url', trie[i].url);
                    li.setAttribute('data-idx', i);
                    li.setAttribute('class', 'compendium-title');
                    var date = document.createElement("p");
                    date.textContent = "Last updated: " + trie[i].updated;
                    date.setAttribute('class', 'date');
                    $(li).append(date);
                    ul.append(li); 
                }
                bindElements();
            }

            var sb = $(this);
            sb.focus();
            var ul = suggestions;
            var ullength = trie.length;
            var oldword = "";
            var index = 0;

            $("body").on("keydown",function(e){
                if(e.keyCode == 13){ //enter
                    e.preventDefault();
                    var url = $(ul.children()[index]).attr('data-url') || escape(sb.val());
                    window.location = url;
                }
                if(e.keyCode == 38){ //up
                    e.preventDefault();
                    index = (index-1)%ullength;
                }else if(e.keyCode === 40){ //down
                    e.preventDefault();
                    index = (index+1)%ullength;
                }
                for(var i=0;i<ullength;i++){
                    $(ul.children()[i]).removeClass("active");
                }
                $(ul.children()[index]).addClass("active");
            });

            reset();

            var refresh = function(e){
                if(oldword === sb.val()) return;
                oldword = sb.val();
                index = 0;
                ul.empty();
                var words = search(trie,oldword);
                ullength = words.length || trie.length;
                for(var i=0;i<words.length;i++){
                    var li = document.createElement("li");
                    li.textContent = words[i].label;
                    li.setAttribute('data-url', words[i].url);
                    li.setAttribute('data-idx', i);
                    li.setAttribute('class', 'compendium-title');
                    var date = document.createElement("p");
                    date.textContent = "Last updated: " + trie[i].updated;
                    date.setAttribute('class', 'date');
                    $(li).append(date);
                    ul.append(li); 
                }
                bindElements();

                if(ul.children().length == 0) {
                    ullength = 0;
                    var li = document.createElement("li");
                    li.textContent = "Sorry no compendiums were found";
                    li.setAttribute('class', 'no-found');
                    ul.append(li);
                }
            }

            setInterval(refresh,100);

        });
    };
})(jQuery);
