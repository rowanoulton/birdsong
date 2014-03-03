Birdsong
========

Create a natural soundscape out of an office of computers.

![The birdsong client](http://cl.ly/image/0D0K1H3K341u/Image%202014-02-20%20at%208.25.23%20pm.png)

### Running the server

With node installed, run `npm install` followed by `node app`

### Connecting as a client

Navigate computers on your local network to `<your ip address>:3000` in their web browser.

### Configuration

Birdsong is configurable, meaning you can create your own soundscapes. Place your configuration inside the `/config` folder then specify it at runtime by passing the filename as the first argument. You can omit the file extension, for example:

```
node app new-zealand-forest-daytime
```

I'd love to include any submissions in the default project set. See the [configuration folder](https://github.com/rowanoulton/birdsong/blob/master/config/new-zealand-forest-daytime.json) for examples.

### Credit

- [XenoCanto](http://xeno-canto.org) for the audio files
- [Numerous photographers](https://github.com/rowanoulton/birdsong/blob/master/config/new-zealand-forest-daytime.json) who can be found in the configuration files
