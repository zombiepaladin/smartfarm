var Clock = (function() {

    var clock = {},
        timer = 0,
        speed = 100,
        interval;

    function tick() {
        timer += 1;
        window.dispatchEvent(new Event('timestep:minute'));
        if(timer % 15 == 0) 
            window.dispatchEvent(new Event('timestep:quarter_hour'));
        if(timer % 60 == 0) 
            window.dispatchEvent(new Event('timestep:hour'));
        if(timer % 1440 == 0) 
            window.dispatchEvent(new Event('timestep:day'));
    }

    clock.run = function() {
        window.clearInterval(interval);
        interval = window.setInterval(tick, speed);
    };

    clock.pause = function() {
        window.clearInterval(interval);
    };

    clock.reset = function() {
        timer = 1;
    };

    clock.faster = function() {
        window.clearInterval(interval);
        speed -= 50;
        if(speed < 50) speed = 50;
        interval = window.setInterval(tick, speed);
    };

    clock.slower = function() {
        window.clearInterval(interval);
        speed += 50;
        interval = window.setInterval(tick, speed);
    };

    return clock;

}());
  
