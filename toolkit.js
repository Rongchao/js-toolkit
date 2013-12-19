/*
 *****************************************************************************
 * COLLECTION
 *****************************************************************************
*/
function each( o, f ) {
  if ( !o || !f ) return;
  if ( typeof o[0] != 'undefined' )
    for ( var i = 0, l = o.length; i < l; )
      f.call( o[i], o[i], i++ );
  else
    for ( var i in o )
      o.hasOwnProperty    &&
      o.hasOwnProperty(i) &&
      f.call( o[i], i, o[i] );
}

function map( list, fun ) {
  var fin = [];
  each( list || [], function( k, v ) { fin.push(fun( k, v )) } );
  return fin;
}
/*
 *****************************************************************************
 * DOM MANIPULATION
 *****************************************************************************
*/
function attr( node, attribute, value ) {
  if (value) node.setAttribute( attribute, value );
  else return node && node.getAttribute && node.getAttribute(attribute);
}

function $(id){ return document.getElementById(id) }

function search( elements, start ) {
  var list = [];
  each( elements.split(/\s+/), function(el) {
    each( (start || document).getElementsByTagName(el), function(node) {
      list.push(node);
    } );
  } );
  return list;
}

function create(element) { return document.createElement(element) }
/*
 *****************************************************************************
 * NATIVE EVENT
 *****************************************************************************
*/
function bind( type, el, fun ) {
  each( type.split(','), function(etype) {
    var rapfun = function(e) {
      if (!e) e = window.event;
      if (!fun(e)) {
        e.cancelBubble = true;
        e.returnValue  = false;
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
      }
    };

    if ( el.addEventListener ) el.addEventListener( etype, rapfun, false );
    else if ( el.attachEvent ) el.attachEvent( 'on' + etype, rapfun );
    else  el[ 'on' + etype ] = rapfun;
  } );
}

function unbind( type, el, fun ) {
  if ( el.removeEventListener ) el.removeEventListener( type, false );
  else if ( el.detachEvent ) el.detachEvent( 'on' + type, false );
  else  el[ 'on' + type ] = null;
}
/*
 *****************************************************************************
 * EVENT SYSTEM AND DELEGATION
 *****************************************************************************
*/
var events = {
  'list'    : {},
  'unbind'  : function( name ) { events.list[name] = []},
  'bind'    : function( name, fun ) {
    (events.list[name] = events.list[name] || []).push(fun);
  },
  'fire'    : function( name, data ) {
    each(
        events.list[name] || [],
        function(fun) { fun(data) }
    );
  }
};

function bubblefind( e, attribute ) {
  var target = e.target || e.srcElement || {}
  ,   result = '';
  while (target) {
    result = attr( target, attribute );
    if (result) return { result : result, target : target };
    target = target.parentNode;
  }
}

function delegate( element, namespace ) {
  bind( 'click', element, function(e) {
    var data   = bubblefind( e, 'data-data' )
    ,   action = bubblefind( e, 'data-action' )
    if (!action) return true;
    events.fire( namespace + '.' + action.result, {
      action : action.result,
      target : action.target,
      data   : data.result
    } );
  } );
}
/*
 *****************************************************************************
 * TEMPLATING
 *****************************************************************************
*/
function supplant( str, values ) {
  return str.replace( /{([\w\-]+)}/g, function( _, match ) {
    return values[match] || _
  } );
}

/*
 *****************************************************************************
 * NETWORKING
 *****************************************************************************
*/
function request(setup) {
  var script    = p.create('script')
  ,   url       = setup.url || ''
  ,   args      = setup.params || {}
  ,   callback  = setup.callback || function(){}
  ,   errorback = setup.errorback || function(){}
  ,   params    = []
  ,   unique    = 'x'+((+new Date)+'') + (++NOW);

  window[unique] = function(msg) {
    setTimeout( function() {
      search('body')[0].removeChild(script);
    }, 5000 );
    if (!msg) return errorback();
    callback(msg);
  };

  script.onerror = errorback;

  args['callback'] = unique;
  each( args, function( k, v ) {
    params.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
  } );

  script.src = url + '?' + params.join('&');
  search('body')[0].appendChild(script);
}
/*
 *****************************************************************************
 * CSS
 *****************************************************************************
*/
function css( element, styles ) {
  for (var style in styles) if (styles.hasOwnProperty(style))
    try {element.style[style] = styles[style] + (
        '|width|height|top|left|'.indexOf(style) > 0 &&
        typeof styles[style] == 'number'
        ? 'px' : ''
        )}catch(e){}
}

/*
 *****************************************************************************
 * ANIMATION
 *****************************************************************************
*/
function animate( node, keyframes, callback ){
  var tranfaobigi = {
    'r'  : 'rotate',
    'rz' : 'rotateZ',
    'rx' : 'rotateX',
    'ry' : 'rotateY',
    'p'  : 'perspective',
    's'  : 'scale',
    'm'  : 'matrix',
    'tx' : 'translateX',
    'ty' : 'translateY'
  }, tranfaobigi_unit = {
    'r'  : 'deg',
    'rz' : 'deg',
    'rx' : 'deg',
    'ry' : 'deg',
    'tx' : 'px',
    'ty' : 'px'
  }, keyframe = keyframes.shift()
   , duration = ( keyframe && keyframe['d'] || 1 ) * 1000
   , callback = callback || function(){};

   if (keyframe) transform( node, keyframe );
   else return callback();

   // Ready for next keyframe
   setTimeout( function(){ animate( node, keyframes, callback ) }, duration );

   function transform( node, keyframe ) {
     var tranbuff  = []
     ,   trans     = ''
     ,   stylebuff = []
     ,   style     = ''
     ,   duration  = ( keyframe['d'] || 1 ) + 's';

     delete keyframe['d'];

     // Transformation CSS3
     each( keyframe, function( k, v ) {
       var what = tranfaobigi[k]
       ,   unit = tranfaobigi_unit[k] || '';

       if (!what) return;
       delete keyframe[k];
       tranbuff.push( what + '(' + v + unit + ')' );
     } );
     trans = tranbuff.join(' ') || '';

     stylebuff.push(
       '-o-transition:all '      + duration,
       '-moz-transition:all '    + duration,
       '-webkit-transition:all ' + duration,
       'transition:all '         + duration,
       '-o-transform:'           + trans,
       '-moz-transform:'         + trans,
       '-webkit-transform:'      + trans,
       'transform:'              + trans
     );

     // CSS2
     each( keyframe, function( k, v ) { stylebuff.push( k + ':' + v ) } );
     style = stylebuff.join(';') || '';
     try { attr( node, 'style', style ) } catch(e) {}
   }
}
