- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index

    - block body
        - if require('@config/config').webpack.ssr
            < p.classssss
                hello
                < .img v-image = imageParams
        - else
            < p.classssss
                hello
                < span.img data-image = preview | style
                    < img :data-img = hash | src = https://fakeimg.pl/300x300 | loading = lazy | style